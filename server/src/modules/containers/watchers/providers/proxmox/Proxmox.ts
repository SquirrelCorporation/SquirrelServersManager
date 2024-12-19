import { URL as NodeURL } from 'url';
import CronJob from 'node-cron';
import { ProxmoxModel, SsmProxmox } from 'ssm-shared-lib';
import ssh from 'ssh2';
import { Dispatcher, RequestInit, Response, request } from 'undici';
import ProxmoxContainer from '../../../../../data/database/model/ProxmoxContainer';
import DeviceAuthRepo from '../../../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../../../data/database/repository/DeviceRepo';
import ProxmoxContainerRepo from '../../../../../data/database/repository/ProxmoxContainerRepo';
import SSHCredentialsHelper from '../../../../../helpers/ssh/SSHCredentialsHelper';
import type { SSMServicesTypes } from '../../../../../types/typings';
import Component from '../../../core/Component';
import { proxmoxApi } from '../../../../../helpers/proxmox-api';

export default class Proxmox extends Component<SSMServicesTypes.ConfigurationWatcherSchema> {
  watchCron!: CronJob.ScheduledTask | undefined;
  watchCronStat!: CronJob.ScheduledTask | undefined;
  watchCronTimeout: any;
  watchCronDebounced: any = undefined;
  proxmoxApi!: ProxmoxModel.Api;

  getConfigurationSchema() {
    return this.joi.object().keys({
      // TODO: move the default somewhere else
      host: this.joi.string(),
      port: this.joi.number().port(),
      username: this.joi.string(),
      password: this.joi.string(),
      cron: this.joi.string().default('0 * * * *'),
      watchstats: this.joi.boolean().default(true),
      cronstats: this.joi.string().default('*/1 * * * *'),
      deviceUuid: this.joi.string().required(),
    });
  }

  async init() {
    await this.initWatcher();

    this.watchCron = CronJob.schedule(this.configuration.cron, () => {
      this.watchContainersFromCron();
    });
  }

  async initWatcher() {
    const device = await DeviceRepo.findOneByUuid(this.configuration.deviceUuid);
    if (!device) {
      throw new Error(
        `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
      );
    }
    const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
    if (!deviceAuth) {
      throw new Error(
        `DeviceAuth not found for deviceID ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
      );
    }
    const options = await SSHCredentialsHelper.getProxmoxConnectionOptions(device, deviceAuth);
    if (deviceAuth?.proxmoxAuth?.remoteMethod === SsmProxmox.RemoteConnectionMethod.SSH) {
      const sshCredentials = await SSHCredentialsHelper.getSShConnection(device, deviceAuth);

      // Add a custom fetch function for SSH
      options.fetch = async (url: string | NodeURL, fetchOptions?: RequestInit) => {
        return new Promise((resolve, reject) => {
          const client = new ssh.Client();

          client
            .on('ready', () => {
              client.forwardOut(
                '127.0.0.1',
                0,
                sshCredentials.host as string,
                sshCredentials.port || 443,
                (err, stream) => {
                  if (err) {
                    client.end();
                    reject(err);
                    return;
                  }

                  try {
                    const parsedUrl = new NodeURL(url.toString());

                    // Create a custom dispatcher to handle the stream
                    const dispatcher: Dispatcher = {
                      connect: (_opts, callback) => {
                        callback(null, stream); // Pass the SSH tunnel stream
                      },
                      destroy: async () => {
                        client.end();
                      }, // Ensure the client is cleaned up
                    };

                    // Create the request using undici.request
                    request(parsedUrl.toString(), {
                      method: fetchOptions?.method || 'GET',
                      headers: fetchOptions?.headers,
                      body: fetchOptions?.body,
                      dispatcher, // Use custom dispatcher
                    })
                      .then((response) => {
                        resolve(
                          new Response(response.body, {
                            status: response.statusCode,
                            headers: response.headers,
                          }),
                        );
                      })
                      .catch((requestErr) => {
                        reject(requestErr);
                      });
                  } catch (parseErr) {
                    reject(parseErr);
                  }
                },
              );
            })
            .on('error', (sshErr) => {
              reject(sshErr);
            })
            .connect(sshCredentials);
        });
      };
    }
    this.childLogger.debug(options);
    this.proxmoxApi = proxmoxApi(options);
  }

  /**
   * Watch containers (called by cron scheduled tasks).
   */
  async watchContainersFromCron() {
    const currentContainers = await this.getContainers();
    const containersInDb = await ProxmoxContainerRepo.findContainersByWatcher(this.name);
    await this.insertOrUpdateContainers(currentContainers);
    this.deleteOldVolumes(currentContainers, containersInDb);
  }

  private deleteOldVolumes(
    newContainers: (ProxmoxContainer | undefined)[] | undefined,
    containersInDb: ProxmoxContainer[] | null,
  ) {
    const containersToRemove = this.getOldContainers(newContainers, containersInDb);
    containersToRemove.forEach((containerToRemove) => {
      void ProxmoxContainerRepo.deleteContainerByUuid(containerToRemove.uuid as string);
    });
  }

  private getOldContainers(
    newContainers: (ProxmoxContainer | undefined)[] | undefined,
    containersInDb: ProxmoxContainer[] | null,
  ) {
    if (!containersInDb || !newContainers) {
      return [];
    }
    return containersInDb.filter((containerInDb) => {
      const isStillToWatch = newContainers.find(
        (newContainer) => newContainer?.id === containerInDb.id,
      );
      return isStillToWatch === undefined;
    });
  }

  private async insertOrUpdateContainers(
    currentContainers: (Partial<ProxmoxContainer> | undefined)[] | undefined,
  ) {
    if (currentContainers && currentContainers.length > 0) {
      await Promise.all(
        currentContainers.map(async (container) => {
          if (container) {
            void ProxmoxContainerRepo.updateOrCreate(container);
          }
        }),
      );
    }
  }

  async getContainers(): Promise<Partial<ProxmoxContainer[]>> {
    try {
      const containers: Partial<ProxmoxContainer[]> = [];
      const nodes = await this.proxmoxApi.nodes.$get();
      // iterate cluster nodes
      for (const node of nodes) {
        const theNode = this.proxmoxApi.nodes.$(node.node);
        this.childLogger.info('getContainers - Node: ' + node.node + '');
        const qemus = await theNode.qemu.$get({ full: true });
        for (const qemu of qemus) {
          const config = await theNode.qemu.$(qemu.vmid).config.$get();
          const status = await theNode.qemu.$(qemu.vmid).status.current.$get();
          const container = {
            id: `${qemu.vmid}`,
            type: SsmProxmox.ContainerType.QEMU,
            name: config.name || config.nameserver || 'unknown',
            status: status.status,
            watcher: this.name,
            config: config,
          };
          this.childLogger.info(`getContainers - container: ${JSON.stringify(container)}`);
          containers.push(container);
        }
        const lxcs = await theNode.lxc.$get();
        // iterate Qemu VMS
        for (const lxc of lxcs) {
          // do some suff.
          const config = await theNode.lxc.$(lxc.vmid).config.$get();
          const status = await theNode.lxc.$(lxc.vmid).status.current.$get();
          const container = {
            id: `${this.configuration.deviceUuid}-${lxc.vmid}`,
            type: SsmProxmox.ContainerType.LXC,
            name: config.name || config.nameserver || 'unknown',
            status: status.status,
            watcher: this.name,
            config: config,
          };
          this.childLogger.info(`getContainers - container: ${JSON.stringify(container)}`);
          containers.push(container);
        }
      }
      return containers;
    } catch (error: any) {
      this.childLogger.error(error);
    }
    return [];
  }

  async deregisterComponent(): Promise<void> {
    this.childLogger.info('deregisterComponent');
    if (this.watchCron) {
      this.watchCron.stop();
      delete this.watchCron;
    }
    if (this.watchCronStat) {
      this.watchCronStat.stop();
      delete this.watchCronStat;
    }
    if (this.watchCronTimeout) {
      clearTimeout(this.watchCronTimeout);
    }
  }
}
