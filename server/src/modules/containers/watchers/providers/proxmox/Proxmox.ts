import debounce from 'debounce';
import CronJob from 'node-cron';
import { ProxmoxModel, SsmContainer, SsmProxmox } from 'ssm-shared-lib';
import Device from '../../../../../data/database/model/Device';
import DeviceAuth from '../../../../../data/database/model/DeviceAuth';
import ProxmoxContainer from '../../../../../data/database/model/ProxmoxContainer';
import DeviceAuthRepo from '../../../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../../../data/database/repository/DeviceRepo';
import ProxmoxContainerRepo from '../../../../../data/database/repository/ProxmoxContainerRepo';
import { proxmoxApi } from '../../../../../helpers/proxmox-api';
import { createSshFetch } from '../../../../../helpers/ssh/axios-ssh';
import SSHCredentialsHelper from '../../../../../helpers/ssh/SSHCredentialsHelper';
import type { SSMServicesTypes } from '../../../../../types/typings';
import Component from '../../../core/Component';

const DEBOUNCED_WATCH_CRON_MS = 5000;

export default class Proxmox extends Component<SSMServicesTypes.ConfigurationWatcherSchema> {
  watchCron!: CronJob.ScheduledTask | undefined;
  watchCronStat!: CronJob.ScheduledTask | undefined;
  watchCronTimeout: any;
  watchCronDebounced: any = undefined;
  proxmoxApi!: ProxmoxModel.Api;

  getConfigurationSchema() {
    return this.joi.object().keys({
      // TODO: move the default somewhere else
      cron: this.joi.string().default('0 * * * *'),
      deviceUuid: this.joi.string().required(),
      watchstats: this.joi.boolean().default(true),
      cronstats: this.joi.string().default('*/1 * * * *'),
      watchbydefault: this.joi.boolean().default(true),
      watchevents: this.joi.boolean().default(true),
      host: this.joi.string(),
    });
  }

  async init() {
    await this.initWatcher();

    this.watchCron = CronJob.schedule(this.configuration.cron, () => {
      this.watchContainersFromCron();
    });

    this.watchCronDebounced = debounce(() => {
      this.watchContainersFromCron();
    }, DEBOUNCED_WATCH_CRON_MS);

    this.watchCron.start();
    void this.watchContainersFromCron();
  }

  static async getProxmoxConnectOptions(device: Device, deviceAuth: DeviceAuth) {
    const options = await SSHCredentialsHelper.getProxmoxConnectionOptions(device, deviceAuth);

    if (deviceAuth?.proxmoxAuth?.remoteConnectionMethod === SsmProxmox.RemoteConnectionMethod.SSH) {
      const sshCredentials = await SSHCredentialsHelper.getSShConnection(device, deviceAuth);
      // Add a custom fetch function for SSH
      options.fetch = createSshFetch(sshCredentials, options.ignoreSslErrors);
      options.host = '127.0.0.1';
    }
    return options;
  }

  static async testProxmoxConnection(device: Device, deviceAuth: DeviceAuth) {
    const options = await Proxmox.getProxmoxConnectOptions(device, deviceAuth);
    const api = proxmoxApi(options);
    return await api.nodes.$get();
  }

  async initWatcher() {
    try {
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
      const options = await Proxmox.getProxmoxConnectOptions(device, deviceAuth);
      this.childLogger.info(
        `initWatcher - Connection method: ${deviceAuth?.proxmoxAuth?.remoteConnectionMethod}`,
      );
      this.childLogger.debug(options);
      this.proxmoxApi = proxmoxApi(options);
    } catch (error: any) {
      this.childLogger.error(error);
    }
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
      this.childLogger.info('getContainers - starting...');
      const device = await DeviceRepo.findOneByUuid(this.configuration.deviceUuid);
      if (!device) {
        throw new Error(
          `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }
      const containers: Partial<ProxmoxContainer[]> = [];
      const nodes = await this.proxmoxApi.nodes.$get();
      this.childLogger.info(`getContainers - got ${nodes?.length} nodes: ${JSON.stringify(nodes)}`);
      // iterate cluster nodes
      for (const node of nodes) {
        const theNode = this.proxmoxApi.nodes.$(node.node);
        this.childLogger.info('getContainers - Node: ' + node.node + '');
        const qemus = await theNode.qemu.$get({ full: true });
        for (const qemu of qemus) {
          const config = await theNode.qemu.$(qemu.vmid).config.$get();
          const status = await theNode.qemu.$(qemu.vmid).status.current.$get();
          const container = {
            device,
            id: `${qemu.vmid}`,
            type: SsmProxmox.ContainerType.QEMU,
            name: config.name || config.nameserver || 'unknown',
            status: status.status?.toLowerCase(),
            watcher: this.name,
            config: config,
            node: node.node,
          };
          this.childLogger.debug(`getContainers - container: ${JSON.stringify(container)}`);
          containers.push(container);
        }
        const lxcs = await theNode.lxc.$get();
        // iterate Qemu VMS
        for (const lxc of lxcs) {
          // do some suff.
          const config = await theNode.lxc.$(lxc.vmid).config.$get();
          const status = await theNode.lxc.$(lxc.vmid).status.current.$get();
          const interfaces = await theNode.lxc.$(lxc.vmid).interfaces.$get();
          const name = lxc.name && lxc.name !== 'unknown' ? lxc.name : config.hostname || 'unknown';
          const container = {
            device,
            id: `${lxc.vmid}`,
            type: SsmProxmox.ContainerType.LXC,
            name,
            status: status.status?.toLowerCase(),
            watcher: this.name,
            config: config,
            node: node.node,
            interfaces,
            hostname: config.hostname,
          } as ProxmoxContainer;
          this.childLogger.debug(`getContainers - container: ${JSON.stringify(container)}`);
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

  async changeContainerStatus(container: ProxmoxContainer, action: SsmContainer.Actions) {
    const containerStatus =
      container.type === SsmProxmox.ContainerType.LXC
        ? this.proxmoxApi.nodes.$(container.node).lxc.$(parseInt(container.id)).status
        : this.proxmoxApi.nodes.$(container.node).lxc.$(parseInt(container.id)).status;
    switch (action) {
      case SsmContainer.Actions.STOP:
        return await containerStatus.stop.$post();
      case SsmContainer.Actions.START:
        return await containerStatus.start.$post();
      case SsmContainer.Actions.RESTART:
        return await containerStatus.reboot.$post();
      case SsmContainer.Actions.PAUSE:
        return await containerStatus.suspend.$post();
      case SsmContainer.Actions.KILL:
        return await containerStatus.shutdown.$post();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}
