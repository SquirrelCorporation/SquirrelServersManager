import CronJob from 'node-cron';
import { updateQueue } from '../../../helpers/queue/queueManager';
import RemoteSSHExecutorComponent from '../core/RemoteSSHExecutorComponent';
import { UpdateStatsType, UpdateType } from '../helpers/queueProcessor';
import CPUComponent from '../system-information/cpu/CPUComponent';
import { FileSystemComponent } from '../system-information/filesystem/FileSystemComponent';
import GraphicsComponent from '../system-information/graphics/GraphicsComponent';
import MemoryComponent from '../system-information/memory/MemoryComponent';
import NetworkComponent from '../system-information/network/NetworkComponent';
import OSInformationComponent from '../system-information/os-information/OSInformationComponent';
import SystemComponent from '../system-information/system/SystemComponent';
import USBComponent from '../system-information/usb/USBComponent';
import UsersComponent from '../system-information/users/UsersComponent';
import WifiComponent from '../system-information/wifi/WifiComponent';

interface CronWatchers {
  [key: string]: {
    cron?: CronJob.ScheduledTask;
    handler: () => Promise<void>;
    config: { watch: boolean; cron: string };
  };
}

class RemoteSystemInformationWatcher extends RemoteSSHExecutorComponent {
  private readonly components: {
    CPU: CPUComponent;
    Memory: MemoryComponent;
    OSInformation: OSInformationComponent;
    FileSystem: FileSystemComponent;
    System: SystemComponent;
    Users: UsersComponent;
    USB: USBComponent;
    WIFI: WifiComponent;
    Graphics: GraphicsComponent;
    Network: NetworkComponent;
  };

  private watchers: CronWatchers;

  constructor() {
    super();
    this.components = {} as any;
    this.watchers = {};
  }

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

  private setupWatcher(
    name: string,
    handler: () => Promise<void>,
    config: { watch: boolean; cron: string },
  ): void {
    if (config.watch) {
      this.logger.info(`Watching ${name}...`);
      this.watchers[name] = {
        handler,
        config,
        cron: CronJob.schedule(config.cron, async () => {
          try {
            await handler();
          } catch (error) {
            this.logger.error(`Error in ${name} watcher:`, error);
          }
        }),
      };
      // Initial run
      handler().catch((error) => this.logger.error(`Error in initial ${name} watch:`, error));
    }
  }

  public async init(): Promise<void> {
    try {
      this.logger.info('Initializing RemoteSystemInformationWatcher...');
      await super.init();

      // Initialize components
      await this.setupComponent('CPU', CPUComponent, this.configuration.deviceUuid);
      await this.setupComponent('Memory', MemoryComponent);
      await this.setupComponent('OSInformation', OSInformationComponent);
      await this.setupComponent('FileSystem', FileSystemComponent);
      await this.setupComponent('Users', UsersComponent);
      await this.setupComponent('USB', USBComponent);
      await this.setupComponent('WIFI', WifiComponent);
      await this.setupComponent('Graphics', GraphicsComponent);
      await this.setupComponent('Network', NetworkComponent);
      await this.setupComponent('System', SystemComponent);

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

      this.logger.info('RemoteSystemInformationWatcher initialized');
    } catch (error) {
      this.logger.error('Failed to initialize RemoteSystemInformationWatcher:', error);
      throw error;
    }
  }

  private async enqueueUpdate(
    deviceUuid: string,
    updateType: UpdateType | UpdateStatsType,
    data: unknown,
  ): Promise<void> {
    try {
      await updateQueue.add({
        deviceUuid,
        updateType,
        data,
      });
    } catch (error) {
      this.logger.error(`Failed to enqueue update for ${updateType}:`, error);
      throw error;
    }
  }

  public async getCPU() {
    const cpu = await this.components.CPU.cpu();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.CPU, cpu);
  }

  public async getCpuStats() {
    const cputStats = await this.components.CPU.getLoad();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateStatsType.CPU_STATS, cputStats);
  }

  public async getMemory() {
    const memoryInfo = await this.components.Memory.mem();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Memory, memoryInfo);
    const memoryLayout = await this.components.Memory.memLayout();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.MemoryLayout, memoryLayout);
  }

  public async getOSInformation() {
    const os = await this.components.OSInformation.osInfo();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.OS, os);
  }

  public async getFileSystems() {
    const diskLayout = await this.components.FileSystem.diskLayout();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.FileSystems, diskLayout);
  }

  public async getMemoryStats() {
    const memoryStats = await this.components.Memory.mem();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateStatsType.MEM_STATS, memoryStats);
  }

  public async getFileSystemStats() {
    const fileSystemsStats = await this.components.FileSystem.fsSize();
    await this.enqueueUpdate(
      this.configuration.deviceUuid,
      UpdateStatsType.FILE_SYSTEM_STATS,
      fileSystemsStats,
    );
  }

  public async getNetworkInterfaces() {
    const _networkInterfaces = await this.components.Network.networkInterfaces();
    const networkInterfaces = Array.isArray(_networkInterfaces)
      ? _networkInterfaces
      : [_networkInterfaces];
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Network, networkInterfaces);
  }

  public async getGraphics() {
    const graphics = await this.components.Graphics.graphics();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Graphics, graphics);
  }

  public async getUSB() {
    const usb = await this.components.USB.usb();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.USB, usb);
  }

  public async getSystem() {
    const system = await this.components.System.system();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.System, system);
  }

  public async getWifi() {
    const wifi = await this.components.WIFI.wifiInterfaces();
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.WiFi, wifi);
  }

  public async getVersions() {
    const versions = await this.components.OSInformation.versions('*');
    await this.enqueueUpdate(this.configuration.deviceUuid, UpdateType.Versions, versions);
  }

  public async deregisterComponent(): Promise<void> {
    this.logger.info('Deregistering RemoteSystemInformationWatcher');
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
}

export default RemoteSystemInformationWatcher;
