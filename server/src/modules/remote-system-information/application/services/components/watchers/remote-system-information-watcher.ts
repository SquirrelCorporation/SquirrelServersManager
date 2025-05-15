import { IDeviceAuthService, IDevicesService } from '@modules/devices';
import { SSHExecutor } from '@modules/remote-system-information/application/services/remote-ssh-executor.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import CronJob from 'node-cron';
import { BluetoothComponent } from '../../../../domain/system-information/bluetooth/BluetoothComponent';
import { CpuComponent } from '../../../../domain/system-information/cpu/cpu.component';
import { FileSystemComponent } from '../../../../domain/system-information/filesystem/FileSystemComponent';
import { GraphicsComponent } from '../../../../domain/system-information/graphics/GraphicsComponent';
import { MemoryComponent } from '../../../../domain/system-information/memory/MemoryComponent';
import { NetworkComponent } from '../../../../domain/system-information/network/NetworkComponent';
import { OSInformationComponent } from '../../../../domain/system-information/os-information/OSInformationComponent';
import { SystemComponent } from '../../../../domain/system-information/system/SystemComponent';
import { USBComponent } from '../../../../domain/system-information/usb/USBComponent';
import { UsersComponent } from '../../../../domain/system-information/users/UsersComponent';
import { WifiComponent } from '../../../../domain/system-information/wifi/WifiComponent';
import { RemoteSystemInformationConfigurationSchema } from '../../../../domain/types/configuration.types';
import { QueueJobData, UpdateStatsType, UpdateType } from '../../../../domain/types/update.types';
import { DebugCallback } from '../../../../domain/types/remote-executor.types';

export enum RemoteSystemComponent {
  CPU = 'CPU',
  Memory = 'Memory',
  OSInformation = 'OSInformation',
  FileSystem = 'FileSystem',
  Users = 'Users',
  USB = 'USB',
  WIFI = 'WIFI',
  Graphics = 'Graphics',
  Network = 'Network',
  System = 'System',
  Bluetooth = 'Bluetooth',
}

export enum RemoteSystemWatcher {
  CPU = 'cpu',
  CPU_STATS = 'cpuStats',
  MEMORY = 'memory',
  MEMORY_STATS = 'memoryStats',
  FILE_SYSTEM = 'fileSystem',
  FILE_SYSTEM_STATS = 'fileSystemStats',
  NETWORK = 'network',
  GRAPHICS = 'graphics',
  USB = 'usb',
  SYSTEM = 'system',
  WIFI = 'wifi',
  OS = 'os',
  VERSIONS = 'versions',
  BLUETOOTH = 'bluetooth',
}

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
    eventEmitter: EventEmitter2,
    config?: Partial<RemoteSystemInformationConfigurationSchema>,
  ) {
    super(devicesService, deviceAuthService, eventEmitter);
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
      await this.setupComponent(
        RemoteSystemComponent.CPU,
        CpuComponent,
        this.configuration.deviceUuid,
      );
      await this.setupComponent(RemoteSystemComponent.Memory, MemoryComponent);
      await this.setupComponent(RemoteSystemComponent.OSInformation, OSInformationComponent);
      await this.setupComponent(RemoteSystemComponent.FileSystem, FileSystemComponent);
      await this.setupComponent(RemoteSystemComponent.Users, UsersComponent);
      await this.setupComponent(RemoteSystemComponent.USB, USBComponent);
      await this.setupComponent(RemoteSystemComponent.WIFI, WifiComponent);
      await this.setupComponent(RemoteSystemComponent.Graphics, GraphicsComponent);
      await this.setupComponent(RemoteSystemComponent.Network, NetworkComponent);
      await this.setupComponent(RemoteSystemComponent.System, SystemComponent);
      await this.setupComponent(RemoteSystemComponent.Bluetooth, BluetoothComponent);

      // Setup watchers
      this.setupWatcher(RemoteSystemWatcher.CPU, () => this.getCPU(), this.configuration.cpu);
      this.setupWatcher(
        RemoteSystemWatcher.CPU_STATS,
        () => this.getCpuStats(),
        this.configuration.cpuStats,
      );
      this.setupWatcher(RemoteSystemWatcher.MEMORY, () => this.getMemory(), this.configuration.mem);
      this.setupWatcher(
        RemoteSystemWatcher.MEMORY_STATS,
        () => this.getMemoryStats(),
        this.configuration.memStats,
      );
      this.setupWatcher(
        RemoteSystemWatcher.FILE_SYSTEM,
        () => this.getFileSystems(),
        this.configuration.fileSystem,
      );
      this.setupWatcher(
        RemoteSystemWatcher.FILE_SYSTEM_STATS,
        () => this.getFileSystemStats(),
        this.configuration.fileSystemStats,
      );
      this.setupWatcher(
        RemoteSystemWatcher.NETWORK,
        () => this.getNetworkInterfaces(),
        this.configuration.networkInterfaces,
      );
      this.setupWatcher(
        RemoteSystemWatcher.GRAPHICS,
        () => this.getGraphics(),
        this.configuration.graphics,
      );
      this.setupWatcher(RemoteSystemWatcher.USB, () => this.getUSB(), this.configuration.usb);
      this.setupWatcher(
        RemoteSystemWatcher.SYSTEM,
        () => this.getSystem(),
        this.configuration.system,
      );
      this.setupWatcher(RemoteSystemWatcher.WIFI, () => this.getWifi(), this.configuration.wifi);
      this.setupWatcher(
        RemoteSystemWatcher.OS,
        () => this.getOSInformation(),
        this.configuration.os,
      );
      this.setupWatcher(
        RemoteSystemWatcher.VERSIONS,
        () => this.getVersions(),
        this.configuration.versions,
      );
      this.setupWatcher(
        RemoteSystemWatcher.BLUETOOTH,
        () => this.getBluetooth(),
        this.configuration.bluetooth,
      );

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
  public async getCPU(debugCallback?: DebugCallback) {
    this.logger.debug('Getting CPU information');
    const cpu = await this.components.CPU.cpu();
    if (debugCallback) {
      debugCallback(JSON.stringify(cpu, null, 2), 'CPU information', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.CPU, cpu);
  }

  /**
   * Get CPU statistics
   */
  public async getCpuStats(debugCallback?: DebugCallback) {
    this.logger.debug('Getting CPU statistics');
    const cputStats = await this.components.CPU.currentLoad();
    if (debugCallback) {
      debugCallback(JSON.stringify(cputStats, null, 2), 'CPU statistics', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateStatsType.CPU_STATS, cputStats);
  }

  /**
   * Get memory information
   */
  public async getMemory(debugCallback?: DebugCallback) {
    this.logger.debug('Getting memory information');
    const memoryInfo = await this.components.Memory.mem();
    if (debugCallback) {
      debugCallback(JSON.stringify(memoryInfo, null, 2), 'Memory information', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Memory, memoryInfo);
    const memoryLayout = await this.components.Memory.memLayout();
    if (debugCallback) {
      debugCallback(JSON.stringify(memoryLayout, null, 2), 'Memory layout', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.MemoryLayout, memoryLayout);
  }

  /**
   * Get OS information
   */
  public async getOSInformation(debugCallback?: DebugCallback) {
    this.logger.debug('Getting OS information');
    const os = await this.components.OSInformation.osInfo();
    if (debugCallback) {
      debugCallback(JSON.stringify(os, null, 2), 'OS information', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.OS, os);
  }

  /**
   * Get filesystem information
   */
  public async getFileSystems(debugCallback?: DebugCallback) {
    this.logger.debug('Getting filesystem information');
    const diskLayout = await this.components.FileSystem.diskLayout();
    if (debugCallback) {
      debugCallback(JSON.stringify(diskLayout, null, 2), 'Filesystem information', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.FileSystems, diskLayout);
  }

  /**
   * Get memory statistics
   */
  public async getMemoryStats(debugCallback?: DebugCallback) {
    this.logger.debug('Getting memory statistics');
    const memoryStats = await this.components.Memory.mem();
    if (debugCallback) {
      debugCallback(JSON.stringify(memoryStats, null, 2), 'Memory statistics', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateStatsType.MEM_STATS, memoryStats);
  }

  /**
   * Get filesystem statistics
   */
  public async getFileSystemStats(debugCallback?: DebugCallback) {
    this.logger.debug('Getting filesystem statistics');
    const fileSystemsStats = await this.components.FileSystem.fsSize();
    if (debugCallback) {
      debugCallback(JSON.stringify(fileSystemsStats, null, 2), 'Filesystem statistics', true);
    }
    await this.enqueueUpdate(
      this.configuration.deviceUuid,
      UpdateStatsType.FILE_SYSTEM_STATS,
      fileSystemsStats,
    );
  }

  /**
   * Get network interface information
   */
  public async getNetworkInterfaces(debugCallback?: DebugCallback) {
    this.logger.debug('Getting network interfaces');
    const _networkInterfaces = await this.components.Network.networkInterfaces();
    const networkInterfaces = Array.isArray(_networkInterfaces)
      ? _networkInterfaces
      : [_networkInterfaces];
    if (debugCallback) {
      debugCallback(JSON.stringify(networkInterfaces, null, 2), 'Network interfaces', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Network, networkInterfaces);
  }

  /**
   * Get graphics information
   */
  public async getGraphics(debugCallback?: DebugCallback) {
    this.logger.debug('Getting graphics information');
    const graphics = await this.components.Graphics.graphics();
    if (debugCallback) {
      debugCallback(JSON.stringify(graphics, null, 2), 'Graphics information', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Graphics, graphics);
  }

  /**
   * Get USB information
   */
  public async getUSB(debugCallback?: DebugCallback) {
    this.logger.debug('Getting USB information');
    const usb = await this.components.USB.usb();
    if (debugCallback) {
      debugCallback(JSON.stringify(usb, null, 2), 'USB information', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.USB, usb);
  }

  /**
   * Get system information
   */
  public async getSystem(debugCallback?: DebugCallback) {
    this.logger.debug('Getting system information');
    const system = await this.components.System.system();
    if (debugCallback) {
      debugCallback(JSON.stringify(system, null, 2), 'System information', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.System, system);
  }

  /**
   * Get WiFi information
   */
  public async getWifi(debugCallback?: DebugCallback) {
    this.logger.debug('Getting WiFi information');
    const wifi = await this.components.WIFI.wifiInterfaces();
    if (debugCallback) {
      debugCallback(JSON.stringify(wifi, null, 2), 'WiFi information', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.WiFi, wifi);
  }

  /**
   * Get version information
   */
  public async getVersions(debugCallback?: DebugCallback) {
    this.logger.debug('Getting version information');
    const versions = await this.components.OSInformation.versions('*');
    if (debugCallback) {
      debugCallback(JSON.stringify(versions, null, 2), 'Version information', true);
    }
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Versions, versions);
  }

  /**
   * Get bluetooth device information
   */
  public async getBluetooth(debugCallback?: DebugCallback) {
    this.logger.debug('Getting bluetooth device information');
    const devices = await this.components.Bluetooth.bluetoothDevices();
    if (debugCallback) {
      debugCallback(JSON.stringify(devices, null, 2), 'Bluetooth devices', true);
    }
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

  /**
   * Execute a component in debug mode
   * @param componentName Component to execute (e.g., 'cpu', 'mem')
   * @param debugCallback Callback to receive debug information
   */
  public async executeComponentDebug(
    componentName: string,
    debugCallback: DebugCallback,
  ): Promise<void> {
    try {
      // Enable debug mode and set the callback
      this.debugCallback = debugCallback;

      // Execute the component based on the name
      try {
        switch (componentName.toLowerCase()) {
          case 'cpu':
            await this.getCPU(debugCallback);
            break;
          case 'mem':
            await this.getMemory(debugCallback);
            break;
          case 'filesystem':
            await this.getFileSystems(debugCallback);
            break;
          case 'system':
            await this.getSystem(debugCallback);
            break;
          case 'os':
            await this.getOSInformation(debugCallback);
            break;
          case 'wifi':
            await this.getWifi(debugCallback);
            break;
          case 'usb':
            await this.getUSB(debugCallback);
            break;
          case 'graphics':
            await this.getGraphics(debugCallback);
            break;
          case 'bluetooth':
            await this.getBluetooth(debugCallback);
            break;
          case 'networkinterfaces':
            await this.getNetworkInterfaces(debugCallback);
            break;
          case 'versions':
            await this.getVersions(debugCallback);
            break;
          default:
            throw new Error(`Component ${componentName} not supported for debug execution`);
        }
      } finally {
        // Disable debug mode
        this.debugCallback = undefined;
      }
    } catch (error: any) {
      this.logger.error(
        `Error executing component ${componentName} in debug mode: ${error.message}`,
      );
      throw error;
    }
  }
}
