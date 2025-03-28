import CronJob from 'node-cron';
import { Queue } from 'bull';
import { SSHExecutor } from '@modules/remote-system-information/application/services/remote-ssh-executor.service';
import { IDeviceAuthService, IDevicesService } from '@modules/devices';
import { QueueJobData, UpdateStatsType, UpdateType } from '../../../../domain/types/update.types';
import { RemoteSystemInformationConfigurationSchema } from '../../../../domain/types/configuration.types';
import { CpuComponent } from '../../../../domain/system-information/cpu/cpu.component';
import { MemoryComponent } from '../../../../domain/system-information/memory/MemoryComponent';
import { OSInformationComponent } from '../../../../domain/system-information/os-information/OSInformationComponent';
import { FileSystemComponent } from '../../../../domain/system-information/filesystem/FileSystemComponent';
import { SystemComponent } from '../../../../domain/system-information/system/SystemComponent';
import { UsersComponent } from '../../../../domain/system-information/users/UsersComponent';
import { USBComponent } from '../../../../domain/system-information/usb/USBComponent';
import { WifiComponent } from '../../../../domain/system-information/wifi/WifiComponent';
import { GraphicsComponent } from '../../../../domain/system-information/graphics/GraphicsComponent';
import { NetworkComponent } from '../../../../domain/system-information/network/NetworkComponent';
import { BluetoothComponent } from '../../../../domain/system-information/bluetooth/BluetoothComponent';

interface CronWatchers {
  [key: string]: {
    cron?: CronJob.ScheduledTask;
    handler: () => Promise<void>;
    config: { watch: boolean; cron: string };
  };
}

/**
 * Default configuration for system information components
 */
const DEFAULT_CONFIG: RemoteSystemInformationConfigurationSchema = {
  deviceUuid: '',
  cpu: { watch: true, cron: '*/30 * * * * *' }, // Every 30 seconds
  cpuStats: { watch: true, cron: '*/10 * * * * *' }, // Every 10 seconds
  mem: { watch: true, cron: '*/30 * * * * *' }, // Every 30 seconds
  memStats: { watch: true, cron: '*/10 * * * * *' }, // Every 10 seconds
  fileSystem: { watch: true, cron: '0 */5 * * * *' }, // Every 5 minutes
  fileSystemStats: { watch: true, cron: '*/30 * * * * *' }, // Every 30 seconds
  networkInterfaces: { watch: true, cron: '0 */5 * * * *' }, // Every 5 minutes
  graphics: { watch: true, cron: '0 */30 * * * *' }, // Every 30 minutes
  usb: { watch: true, cron: '0 */15 * * * *' }, // Every 15 minutes
  system: { watch: true, cron: '0 0 */2 * * *' }, // Every 2 hours
  wifi: { watch: true, cron: '0 */10 * * * *' }, // Every 10 minutes
  os: { watch: true, cron: '0 0 */6 * * *' }, // Every 6 hours
  versions: { watch: true, cron: '0 0 */12 * * *' }, // Every 12 hours
  bluetooth: { watch: true, cron: '0 */15 * * * *' }, // Every 15 minutes
};

/**
 * Watcher for remote system information
 * Manages components and schedules data collection
 */
export class RemoteSystemInformationWatcher extends SSHExecutor {
  private readonly components: {
    CPU: CpuComponent;
    Memory: MemoryComponent;
    OSInformation: OSInformationComponent;
    FileSystem: FileSystemComponent;
    System: SystemComponent;
    Users: UsersComponent;
    USB: USBComponent;
    WIFI: WifiComponent;
    Graphics: GraphicsComponent;
    Network: NetworkComponent;
    Bluetooth: BluetoothComponent;
  };
  private retryCount = 0; // Track the number of retries
  private readonly MAX_BACKOFF_TIME = 30 * 60 * 1000; // Maximum delay of 30 minutes (in milliseconds)
  private watchers: CronWatchers;

  constructor(
    devicesService: IDevicesService,
    deviceAuthService: IDeviceAuthService,
    private readonly queue: Queue<QueueJobData>,
    config?: Partial<RemoteSystemInformationConfigurationSchema>,
  ) {
    super(devicesService, deviceAuthService);
    this.components = {} as any;
    this.watchers = {};

    // Merge provided config with default config
    this.configuration = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Setup a component
   */
  private async setupComponent<T>(
    name: keyof typeof this.components,
    ComponentClass: new (...args: any[]) => T,
    ...args: any[]
  ): Promise<void> {
    try {
      this.components[name] = new ComponentClass(
        this.execAsync,
        this.execWithCallback,
        ...args,
      ) as any;
      await this.components[name].init();
    } catch (error) {
      this.logger.error(`Failed to initialize ${name} component:`, error);
      throw error;
    }
  }

  /**
   * Setup a watcher with a cron schedule
   */
  private setupWatcher(
    name: string,
    handler: () => Promise<void>,
    config: { watch: boolean; cron: string },
  ): void {
    if (config.watch) {
      this.logger.debug(`Setting up watcher for ${name} with schedule: ${config.cron}`);
      this.watchers[name] = {
        handler,
        config,
        cron: CronJob.schedule(config.cron, async () => {
          try {
            await handler();
          } catch (error: any) {
            this.logger.error(`Error in ${name} watcher: ${error?.message}`);
          }
        }),
      };
      // Initial run
      handler().catch((error) =>
        this.logger.error(`Error in initial ${name} watch: ${error.message}`),
      );
    }
  }

  /**
   * Initialize the watcher and all components
   */
  public async init(): Promise<void> {
    try {
      this.logger.debug('Initializing RemoteSystemInformationWatcher...');
      await super.init();
      // Initialize components
      await this.setupComponent('CPU', CpuComponent, this.configuration.deviceUuid);
      await this.setupComponent('Memory', MemoryComponent);
      await this.setupComponent('OSInformation', OSInformationComponent);
      await this.setupComponent('FileSystem', FileSystemComponent);
      await this.setupComponent('Users', UsersComponent);
      await this.setupComponent('USB', USBComponent);
      await this.setupComponent('WIFI', WifiComponent);
      await this.setupComponent('Graphics', GraphicsComponent);
      await this.setupComponent('Network', NetworkComponent);
      await this.setupComponent('System', SystemComponent);
      await this.setupComponent('Bluetooth', BluetoothComponent);

      // Setup watchers
      this.setupWatcher('cpu', () => this.getCPU(), this.configuration.cpu);
      this.setupWatcher('cpuStats', () => this.getCpuStats(), this.configuration.cpuStats);
      this.setupWatcher('memory', () => this.getMemory(), this.configuration.mem);
      this.setupWatcher('memoryStats', () => this.getMemoryStats(), this.configuration.memStats);
      this.setupWatcher('fileSystem', () => this.getFileSystems(), this.configuration.fileSystem);
      this.setupWatcher(
        'fileSystemStats',
        () => this.getFileSystemStats(),
        this.configuration.fileSystemStats,
      );
      this.setupWatcher(
        'network',
        () => this.getNetworkInterfaces(),
        this.configuration.networkInterfaces,
      );
      this.setupWatcher('graphics', () => this.getGraphics(), this.configuration.graphics);
      this.setupWatcher('usb', () => this.getUSB(), this.configuration.usb);
      this.setupWatcher('system', () => this.getSystem(), this.configuration.system);
      this.setupWatcher('wifi', () => this.getWifi(), this.configuration.wifi);
      this.setupWatcher('os', () => this.getOSInformation(), this.configuration.os);
      this.setupWatcher('versions', () => this.getVersions(), this.configuration.versions);
      this.setupWatcher('bluetooth', () => this.getBluetooth(), this.configuration.bluetooth);

      this.logger.debug('RemoteSystemInformationWatcher initialized');
    } catch (error) {
      this.retryCount++;
      const backoffDelay = Math.min(
        this.getExponentialBackoffDelay(this.retryCount),
        this.MAX_BACKOFF_TIME,
      );

      this.logger.error(
        `Initialization failed. Retrying after ${backoffDelay / 1000} seconds (attempt ${this.retryCount}).`,
        error,
      );

      // Retry after a delay
      setTimeout(() => {
        this.init().catch((err) => {
          this.logger.error('Retry failed:', err);
        });
      }, backoffDelay);
    }
  }

  /**
   * Helper method to calculate the exponential backoff delay
   */
  private getExponentialBackoffDelay(retryCount: number): number {
    const baseDelay = 1000; // Base delay of 1 second
    return baseDelay * Math.pow(2, retryCount); // Exponential growth: 2^retryCount * base delay
  }

  /**
   * Add a job to the queue
   */
  private async enqueueUpdate(
    deviceUuid: string,
    updateType: UpdateType | UpdateStatsType,
    data: unknown,
  ): Promise<void> {
    try {
      this.logger.debug(`Enqueuing update for ${updateType}`);
      await this.queue.add({
        deviceUuid,
        updateType,
        data,
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to enqueue update for ${updateType} (${this.configuration.deviceUuid}, ${this.configuration.host}): ${error?.message}`,
      );
      throw error;
    }
  }

  /**
   * Get CPU information
   */
  public async getCPU() {
    this.logger.debug('Getting CPU information');
    const cpu = await this.components.CPU.cpu();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.CPU, cpu);
  }

  /**
   * Get CPU statistics
   */
  public async getCpuStats() {
    this.logger.debug('Getting CPU statistics');
    const cputStats = await this.components.CPU.currentLoad();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateStatsType.CPU_STATS, cputStats);
  }

  /**
   * Get memory information
   */
  public async getMemory() {
    this.logger.debug('Getting memory information');
    const memoryInfo = await this.components.Memory.mem();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Memory, memoryInfo);
    const memoryLayout = await this.components.Memory.memLayout();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.MemoryLayout, memoryLayout);
  }

  /**
   * Get OS information
   */
  public async getOSInformation() {
    this.logger.debug('Getting OS information');
    const os = await this.components.OSInformation.osInfo();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.OS, os);
  }

  /**
   * Get filesystem information
   */
  public async getFileSystems() {
    this.logger.debug('Getting filesystem information');
    const diskLayout = await this.components.FileSystem.diskLayout();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.FileSystems, diskLayout);
  }

  /**
   * Get memory statistics
   */
  public async getMemoryStats() {
    this.logger.debug('Getting memory statistics');
    const memoryStats = await this.components.Memory.mem();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateStatsType.MEM_STATS, memoryStats);
  }

  /**
   * Get filesystem statistics
   */
  public async getFileSystemStats() {
    this.logger.debug('Getting filesystem statistics');
    const fileSystemsStats = await this.components.FileSystem.fsSize();
    await this.enqueueUpdate(
      this.configuration.deviceUuid,
      UpdateStatsType.FILE_SYSTEM_STATS,
      fileSystemsStats,
    );
  }

  /**
   * Get network interface information
   */
  public async getNetworkInterfaces() {
    this.logger.debug('Getting network interfaces');
    const _networkInterfaces = await this.components.Network.networkInterfaces();
    const networkInterfaces = Array.isArray(_networkInterfaces)
      ? _networkInterfaces
      : [_networkInterfaces];
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Network, networkInterfaces);
  }

  /**
   * Get graphics information
   */
  public async getGraphics() {
    this.logger.debug('Getting graphics information');
    const graphics = await this.components.Graphics.graphics();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Graphics, graphics);
  }

  /**
   * Get USB information
   */
  public async getUSB() {
    this.logger.debug('Getting USB information');
    const usb = await this.components.USB.usb();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.USB, usb);
  }

  /**
   * Get system information
   */
  public async getSystem() {
    this.logger.debug('Getting system information');
    const system = await this.components.System.system();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.System, system);
  }

  /**
   * Get WiFi information
   */
  public async getWifi() {
    this.logger.debug('Getting WiFi information');
    const wifi = await this.components.WIFI.wifiInterfaces();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.WiFi, wifi);
  }

  /**
   * Get version information
   */
  public async getVersions() {
    this.logger.debug('Getting version information');
    const versions = await this.components.OSInformation.versions('*');
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Versions, versions);
  }

  /**
   * Get bluetooth device information
   */
  public async getBluetooth() {
    this.logger.debug('Getting bluetooth device information');
    const devices = await this.components.Bluetooth.bluetoothDevices();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Bluetooth, devices);
  }

  /**
   * Deregister the component and stop all watchers
   */
  public async deregisterComponent(): Promise<void> {
    this.logger.debug('Deregistering RemoteSystemInformationWatcher');
    try {
      // Stop all watchers
      Object.entries(this.watchers).forEach(([name, watcher]) => {
        if (watcher.cron) {
          this.logger.debug(`Stopping ${name} watcher`);
          watcher.cron.stop();
          delete watcher.cron;
        }
      });

      // Clear watchers
      this.watchers = {};
    } catch (error) {
      this.logger.error('Error during deregistration:', error);
      throw error;
    }
  }

  /**
   * Get the state of all components
   */
  public getComponentsState(): any {
    return Object.keys(this.components).reduce(
      (acc, key) => {
        acc[key] = {
          initialized: !!this.components[key as keyof typeof this.components],
        };
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  /**
   * Get the state of all watchers
   */
  public getWatchersState(): any {
    return Object.keys(this.watchers).reduce(
      (acc, key) => {
        acc[key] = {
          active: !!this.watchers[key].cron,
          schedule: this.watchers[key].config.cron,
        };
        return acc;
      },
      {} as Record<string, any>,
    );
  }
}
