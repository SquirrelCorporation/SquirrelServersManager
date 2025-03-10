import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import debounce from 'debounce';
import CronJob from 'node-cron';
import { ProxmoxModel, SsmContainer, SsmProxmox } from 'ssm-shared-lib';
import { ProxmoxContainerRepository } from '../../../repositories/proxmox-container.repository';
import { ProxmoxContainerDocument } from '../../../schemas/proxmox-container.schema';
import { proxmoxApi } from '../../../../../helpers/proxmox-api';
import { createSshFetch } from '../../../../../helpers/ssh/axios-ssh';
import SSHCredentialsHelper from '../../../../../helpers/ssh/SSHCredentialsHelper';
import { SSMServicesTypes } from '../../../../../types/typings';
import { Kind } from '../../../core/Component';
import PinoLogger from '../../../../../logger';
import { DevicesService } from '../../../../../modules/devices';
import { IDevice } from '../../../../../modules/devices';
import { IDeviceAuth } from '../../../../../modules/devices';

const DEBOUNCED_WATCH_CRON_MS = 5000;
const logger = PinoLogger.child({ module: 'ProxmoxService' }, { msgPrefix: '[PROXMOX_SERVICE] - ' });

@Injectable()
export class ProxmoxService implements OnModuleInit, OnModuleDestroy {
  private watchCron?: CronJob.ScheduledTask;
  private watchCronStat?: CronJob.ScheduledTask;
  private watchCronTimeout: any;
  private watchCronDebounced: any = undefined;
  private proxmoxApi!: ProxmoxModel.Api;

  // Configuration properties
  private _id: string = 'unknown';
  private kind: Kind = Kind.WATCHER;
  private type: string = 'proxmox';
  private name: string = 'proxmox';
  private configuration!: SSMServicesTypes.ConfigurationWatcherSchema;
  private childLogger = logger;

  constructor(
    private readonly proxmoxContainerRepository: ProxmoxContainerRepository,
    private readonly devicesService: DevicesService
  ) {}

  async onModuleInit() {
    // This will be called when the module is initialized
    // We'll need to set up the configuration before initializing
  }

  async onModuleDestroy() {
    // Clean up when the module is destroyed
    await this.deregisterComponent();
  }

  /**
   * Initialize the service with configuration
   */
  async initialize(
    _id: string,
    kind: Kind,
    type: string,
    name: string,
    configuration: SSMServicesTypes.ConfigurationWatcherSchema
  ) {
    this._id = _id;
    this.kind = kind;
    this.type = type;
    this.name = name;
    this.configuration = configuration;
    this.childLogger = PinoLogger.child(
      {
        module: `${kind.charAt(0).toUpperCase() + kind.slice(1)}`,
        moduleId: `${this._id}`,
        moduleName: `${name}`,
        moduleType: `${type}`,
      },
      { msgPrefix: `[${kind.toUpperCase()}][${type.toUpperCase()}] - ` },
    );
    this.childLogger.info(
      `Registering ${this.kind?.toLowerCase()} with configuration: ${JSON.stringify(this.maskConfiguration())}`,
    );
    await this.init();
    return this;
  }

  /**
   * Mask sensitive configuration data
   */
  maskConfiguration() {
    return this.configuration;
  }

  /**
   * Get the component ID
   */
  getId() {
    return `${this.kind}.${this.type}.${this.name}`;
  }

  /**
   * Initialize the watcher
   */
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

  /**
   * Get Proxmox connection options
   */
  static async getProxmoxConnectOptions(device: IDevice, deviceAuth: IDeviceAuth) {
    const options = await SSHCredentialsHelper.getProxmoxConnectionOptions(device, deviceAuth);

    if (deviceAuth?.proxmoxAuth?.remoteConnectionMethod === SsmProxmox.RemoteConnectionMethod.SSH) {
      const sshCredentials = await SSHCredentialsHelper.getSShConnection(device, deviceAuth);
      // Add a custom fetch function for SSH
      options.fetch = createSshFetch(sshCredentials, options.ignoreSslErrors);
      options.host = '127.0.0.1';
    }
    return options;
  }

  /**
   * Test Proxmox connection
   */
  static async testProxmoxConnection(device: IDevice, deviceAuth: IDeviceAuth) {
    const options = await ProxmoxService.getProxmoxConnectOptions(device, deviceAuth);
    const api = proxmoxApi(options);
    return await api.nodes.$get();
  }

  /**
   * Initialize the watcher
   */
  async initWatcher() {
    try {
      const device = await this.devicesService.findOneByUuid(this.configuration.deviceUuid);
      if (!device) {
        throw new Error(
          `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }
      const deviceAuthList = await this.devicesService.findDeviceAuthByDeviceUuid(device.uuid);
      if (!deviceAuthList || deviceAuthList.length === 0) {
        throw new Error(
          `DeviceAuth not found for deviceID ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }
      const deviceAuth = deviceAuthList[0];
      const options = await ProxmoxService.getProxmoxConnectOptions(device, deviceAuth);
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
   * Watch containers (called by cron scheduled tasks)
   */
  async watchContainersFromCron() {
    const currentContainers = await this.getContainers();
    const containersInDb = await this.proxmoxContainerRepository.findContainersByWatcher(this.name);
    await this.insertOrUpdateContainers(currentContainers);
    this.deleteOldVolumes(currentContainers, containersInDb);
  }

  /**
   * Delete old volumes
   */
  private deleteOldVolumes(
    newContainers: (Partial<ProxmoxContainerDocument> | undefined)[] | undefined,
    containersInDb: ProxmoxContainerDocument[] | null,
  ) {
    const containersToRemove = this.getOldContainers(newContainers, containersInDb);
    containersToRemove.forEach((containerToRemove) => {
      void this.proxmoxContainerRepository.deleteContainerByUuid(containerToRemove.uuid as string);
    });
  }

  /**
   * Get old containers
   */
  private getOldContainers(
    newContainers: (Partial<ProxmoxContainerDocument> | undefined)[] | undefined,
    containersInDb: ProxmoxContainerDocument[] | null,
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

  /**
   * Insert or update containers
   */
  private async insertOrUpdateContainers(
    currentContainers: (Partial<ProxmoxContainerDocument> | undefined)[] | undefined,
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

  /**
   * Get containers from Proxmox
   */
  async getContainers(): Promise<Partial<ProxmoxContainerDocument[]>> {
    try {
      this.childLogger.info('getContainers - starting...');
      const device = await this.devicesService.findOneByUuid(this.configuration.deviceUuid);
      if (!device) {
        throw new Error(
          `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }
      const containers: Partial<ProxmoxContainerDocument[]> = [];
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
          containers.push(container as ProxmoxContainerDocument);
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
          } as ProxmoxContainerDocument;
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

  /**
   * Deregister the component
   */
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

  /**
   * Change container status
   */
  async changeContainerStatus(container: ProxmoxContainerDocument, action: SsmContainer.Actions) {
    const containerStatus =
      container.type === SsmProxmox.ContainerType.LXC
        ? this.proxmoxApi.nodes.$(container.node).lxc.$(parseInt(container.id)).status
        : this.proxmoxApi.nodes.$(container.node).qemu.$(parseInt(container.id)).status;
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