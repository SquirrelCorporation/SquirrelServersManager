import debounce from 'debounce';
import CronJob from 'node-cron';
import { ProxmoxModel, SsmContainer, SsmProxmox } from 'ssm-shared-lib';
import { createSshFetch } from '@infrastructure/adapters/ssh/axios-ssh.adapter';
import { SSHCredentialsAdapter } from '@infrastructure/adapters/ssh/ssh-credentials.adapter';
import { IDevice, IDeviceAuth } from '@modules/devices';
import { proxmoxApi } from '@infrastructure/adapters/proxmox';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { IProxmoxContainer } from '@modules/containers/domain/entities/proxmox-container.entity';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '@modules/containers/domain/interfaces/container-service.interface';
import { IProxmoxContainerRepository } from '@modules/containers/domain/repositories/proxmox-container.repository.interface';
import { PROXMOX_CONTAINER_REPOSITORY } from '@modules/containers/domain/repositories/proxmox-container.repository.interface';
import { IWatcherComponent } from '@modules/containers/domain/components/watcher.interface';
import { AbstractWatcherComponent } from '../../abstract-watcher.component';

const DEBOUNCED_WATCH_CRON_MS = 5000;

export default class ProxmoxWatcherComponent
  extends AbstractWatcherComponent
  implements IWatcherComponent
{
  watchCron!: CronJob.ScheduledTask | undefined;
  watchCronStat!: CronJob.ScheduledTask | undefined;
  watchCronTimeout: any;
  watchCronDebounced: any = undefined;
  proxmoxApi!: ProxmoxModel.Api;

  constructor(
    protected readonly eventEmitter: EventEmitter2,
    @Inject(PROXMOX_CONTAINER_REPOSITORY)
    private readonly proxmoxContainerRepository: IProxmoxContainerRepository,
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService,
  ) {
    super();
  }
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

  maskConfiguration() {
    return this.configuration;
  }

  async init() {
    await this.initWatcher();

    this.watchCron = CronJob.schedule(this.configuration.cron, () => {
      this.watch();
    });

    this.watchCronDebounced = debounce(() => {
      this.watch();
    }, DEBOUNCED_WATCH_CRON_MS);

    this.watchCron.start();
    void this.watch();
  }

  static async getProxmoxConnectOptions(device: IDevice, deviceAuth: IDeviceAuth) {
    const sshHelper = new SSHCredentialsAdapter();
    const options = await sshHelper.getProxmoxConnectionOptions(device, deviceAuth);

    if (deviceAuth?.proxmoxAuth?.remoteConnectionMethod === SsmProxmox.RemoteConnectionMethod.SSH) {
      const sshCredentials = await sshHelper.getSShConnection(device, deviceAuth);
      // Add a custom fetch function for SSH
      options.fetch = createSshFetch(sshCredentials, options.ignoreSslErrors);
      options.host = '127.0.0.1';
    }
    return options;
  }

  static async testProxmoxConnection(device: IDevice, deviceAuth: IDeviceAuth) {
    const options = await this.getProxmoxConnectOptions(device, deviceAuth);
    const api = proxmoxApi(options);
    return await api.nodes.$get();
  }

  async initWatcher() {
    try {
      const device = await this.containerService.getDeviceByUuid(this.configuration.deviceUuid);
      if (!device) {
        throw new Error(
          `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }
      const deviceAuth = await this.containerService.getDeviceAuth(device.uuid);
      if (!deviceAuth) {
        throw new Error(
          `DeviceAuth not found for deviceID ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }
      const options = await ProxmoxWatcherComponent.getProxmoxConnectOptions(device, deviceAuth);
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
  async watch() {
    const currentContainers = await this.listContainers();
    const containersInDb = await this.proxmoxContainerRepository.findByWatcher(this.name);
    await this.insertOrUpdateContainers(currentContainers);
    this.deleteOldVolumes(currentContainers, containersInDb);
  }

  private deleteOldVolumes(
    newContainers: (Partial<IProxmoxContainer> | undefined)[] | undefined,
    containersInDb: IProxmoxContainer[] | null,
  ) {
    const containersToRemove = this.getOldContainers(newContainers, containersInDb);
    containersToRemove.forEach((containerToRemove) => {
      void this.proxmoxContainerRepository.deleteByUuid(containerToRemove.uuid as string);
    });
  }

  private getOldContainers(
    newContainers: (Partial<IProxmoxContainer> | undefined)[] | undefined,
    containersInDb: IProxmoxContainer[] | null,
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
    currentContainers: (Partial<IProxmoxContainer> | undefined)[] | undefined,
  ) {
    if (currentContainers && currentContainers.length > 0) {
      await Promise.all(
        currentContainers.map(async (container) => {
          if (container) {
            void this.proxmoxContainerRepository.updateOrCreate(container);
          }
        }),
      );
    }
  }

  async listContainers(): Promise<Partial<IProxmoxContainer>[]> {
    try {
      this.childLogger.info('getContainers - starting...');
      const containers: Partial<IProxmoxContainer>[] = [];
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
          const container: Partial<IProxmoxContainer> = {
            deviceUuid: this.configuration.deviceUuid,
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
            deviceUuid: this.configuration.deviceUuid,
            id: `${lxc.vmid}`,
            type: SsmProxmox.ContainerType.LXC,
            name,
            status: status.status?.toLowerCase(),
            watcher: this.name,
            config: config,
            node: node.node,
            interfaces,
            hostname: config.hostname,
          } as IProxmoxContainer;
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

  async changeContainerStatus(container: IProxmoxContainer, action: SsmContainer.Actions) {
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

  async stopContainer(container: any): Promise<void> {
    await this.changeContainerStatus(container, SsmContainer.Actions.STOP);
  }

  async startContainer(container: any): Promise<void> {
    await this.changeContainerStatus(container, SsmContainer.Actions.START);
  }

  async restartContainer(container: any): Promise<void> {
    await this.changeContainerStatus(container, SsmContainer.Actions.RESTART);
  }

  async pauseContainer(container: any): Promise<void> {
    await this.changeContainerStatus(container, SsmContainer.Actions.PAUSE);
  }

  async unpauseContainer(container: any): Promise<void> {
    await this.changeContainerStatus(container, SsmContainer.Actions.START);
  }

  async killContainer(container: any): Promise<void> {
    await this.changeContainerStatus(container, SsmContainer.Actions.KILL);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getContainerLogs(container: any): Promise<string> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getContainer(containerId: string): Promise<any> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removeContainer(container: any): Promise<void> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createContainer(container: any): Promise<void> {
    throw new Error('Not implemented');
  }
}
