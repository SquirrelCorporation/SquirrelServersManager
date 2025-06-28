import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { SsmAgent } from 'ssm-shared-lib';
import Events from 'src/core/events/events';
import { IDevice } from '../../../../devices/domain/entities/device.entity';
import {
  DEVICE_AUTH_SERVICE,
  IDeviceAuthService,
} from '../../../../devices/domain/services/device-auth-service.interface';
import {
  DEVICES_SERVICE,
  IDevicesService,
} from '../../../../devices/domain/services/devices-service.interface';
import { IComponent } from '../../../doma../../domain/interfaces/component.interface';
import { IRemoteSystemInformationEngineService } from '../../../domain/interfaces/remote-system-information-engine-service.interface';
import { RemoteSystemInformationConfigurationSchema } from '../../../domain/types/configuration.types';
import { DebugCallback } from '../../../domain/types/remote-executor.types';
import { REMOTE_SYSTEM_INFO_QUEUE } from '../../../infrastructure/queue/constants';
import { RemoteSystemInformationWatcher } from '../components/watchers/remote-system-information-watcher';

/**
 * Service for managing remote system information collection
 */
@Injectable()
export class RemoteSystemInformationEngineService implements IRemoteSystemInformationEngineService {
  private readonly logger = new Logger(RemoteSystemInformationEngineService.name);
  private state: {
    watchers: Record<string, RemoteSystemInformationWatcher>;
  } = {
    watchers: {},
  };
  constructor(
    @Inject(forwardRef(() => DEVICES_SERVICE))
    private readonly devicesService: IDevicesService,
    @Inject(forwardRef(() => DEVICE_AUTH_SERVICE))
    private readonly deviceAuthService: IDeviceAuthService,
    @InjectQueue(REMOTE_SYSTEM_INFO_QUEUE) private readonly systemInfoQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Initialize the remote system information engine
   */
  async init(): Promise<void> {
    this.logger.log('Initializing RemoteSystemInformationEngineService...');
    await this.registerWatchers();
    this.logger.log('RemoteSystemInformationEngineService initialized');
  }

  /**
   * Register a component.
   *
   * @param _id
   * @param {*} provider
   * @param {*} name
   * @param {*} configuration
   */
  async registerComponent(
    _id: string,
    provider: string,
    name: string,
    configuration: RemoteSystemInformationConfigurationSchema,
  ) {
    const providerLowercase = provider.toLowerCase();
    const nameLowercase = name.toLowerCase();
    try {
      this.logger.log(`Registering "${provider}/${name}" component...`);
      const component = new RemoteSystemInformationWatcher(
        this.devicesService,
        this.deviceAuthService,
        this.systemInfoQueue,
        this.eventEmitter,
      );
      const componentRegistered = await component.register(_id, nameLowercase, configuration);
      this.state.watchers[componentRegistered.getId()] = componentRegistered;

      return componentRegistered;
    } catch (e: any) {
      this.logger.error(
        e,
        `Error when registering component ${providerLowercase}/${nameLowercase} (${e.message})`,
      );
    }
  }

  /**
   * Register a watcher for a specific device
   * @param device The device to register a watcher for
   */
  async registerWatcher(device: IDevice): Promise<any> {
    try {
      return await this.registerComponent(
        device._id,
        'Watcher',
        `remote-system-information-${device.uuid}`,
        {
          cpu: {
            watch: !!device.configuration?.systemInformation?.cpu?.watch,
            cron: device.configuration?.systemInformation?.cpu?.cron || '0 0 * * *',
          },
          cpuStats: {
            watch: !!device.configuration?.systemInformation?.cpuStats?.watch,
            cron: device.configuration?.systemInformation?.cpuStats?.cron || '0 0 * * *',
          },
          mem: {
            watch: !!device.configuration?.systemInformation?.mem?.watch,
            cron: device.configuration?.systemInformation?.mem?.cron || '0 0 * * *',
          },
          memStats: {
            watch: !!device.configuration?.systemInformation?.memStats?.watch,
            cron: device.configuration?.systemInformation?.memStats?.cron || '0 0 * * *',
          },
          fileSystem: {
            watch: !!device.configuration?.systemInformation?.fileSystems?.watch,
            cron: device.configuration?.systemInformation?.fileSystems?.cron || '0 0 * * *',
          },
          fileSystemStats: {
            watch: !!device.configuration?.systemInformation?.fileSystemsStats?.watch,
            cron: device.configuration?.systemInformation?.fileSystemsStats?.cron || '0 0 * * *',
          },
          system: {
            watch: !!device.configuration?.systemInformation?.system?.watch,
            cron: device.configuration?.systemInformation?.system?.cron || '0 0 * * *',
          },
          os: {
            watch: !!device.configuration?.systemInformation?.os?.watch,
            cron: device.configuration?.systemInformation?.os?.cron || '0 0 * * *',
          },
          wifi: {
            watch: !!device.configuration?.systemInformation?.wifi?.watch,
            cron: device.configuration?.systemInformation?.wifi?.cron || '0 0 * * *',
          },
          usb: {
            watch: !!device.configuration?.systemInformation?.usb?.watch,
            cron: device.configuration?.systemInformation?.usb?.cron || '0 0 * * *',
          },
          graphics: {
            watch: !!device.configuration?.systemInformation?.graphics?.watch,
            cron: device.configuration?.systemInformation?.graphics?.cron || '0 0 * * *',
          },
          bluetooth: {
            watch: !!device.configuration?.systemInformation?.bluetooth?.watch,
            cron: device.configuration?.systemInformation?.bluetooth?.cron || '0 0 * * *',
          },
          networkInterfaces: {
            watch: !!device.configuration?.systemInformation?.networkInterfaces?.watch,
            cron: device.configuration?.systemInformation?.networkInterfaces?.cron || '0 0 * * *',
          },
          versions: {
            watch: !!device.configuration?.systemInformation?.versions?.watch,
            cron: device.configuration?.systemInformation?.versions?.cron || '0 0 * * *',
          },
          host: device.ip,
          deviceUuid: device.uuid,
        },
      );
    } catch (error) {
      this.logger.error(error, `Failed to register watcher for device ${device.uuid}:`);
      throw error;
    }
  }

  /**
   * Register all watchers based on devices in the database
   */
  async registerWatchers(): Promise<any> {
    try {
      this.logger.log('Registering watchers for all devices...');

      // Get all devices that should be monitored (online and enabled)
      const devices = await this.devicesService.findWithFilter({
        agentType: { $eq: SsmAgent.InstallMethods.LESS },
      });

      if (!devices) {
        this.logger.error('No devices found');
        return;
      }

      // Register a watcher for each device
      const registrationPromises = devices?.map((device) =>
        this.registerWatcher(device).catch((error) => {
          this.logger.error(error, `Failed to register watcher for device ${device.uuid}:`);
          return null;
        }),
      );

      // Wait for all registrations to complete
      const results = await Promise.all(registrationPromises);

      this.logger.log(
        `Registered ${results.filter(Boolean).length} watchers out of ${devices?.length} devices`,
      );
    } catch (error) {
      this.logger.error(error, 'Failed to register watchers:');
      throw error;
    }
  }

  /**
   * Deregister a component.
   * @param component
   * @returns {Promise}
   */
  async deregisterComponent(component: IComponent): Promise<any> {
    try {
      await component.deregister();
    } catch (e: any) {
      throw new Error(
        `Error when de-registering component ${component.getId()} (error: ${e.message})`,
      );
    } finally {
      if (this.state.watchers) {
        delete this.state.watchers[component.getId() as keyof typeof this.state.watchers];
      }
    }
  }

  /**
   * Deregister all components of kind.
   * @param components
   * @returns {Promise}
   */
  async deregisterComponents(components: IComponent[]): Promise<any> {
    const deregisterPromises = components.map(async (component) =>
      this.deregisterComponent(component),
    );
    return Promise.all(deregisterPromises);
  }

  async deregisterWatchers(): Promise<any> {
    return this.deregisterComponents(Object.values(this.state.watchers));
  }
  /**
   * Deregister all components.
   * @returns {Promise}
   */
  async deregisterAll(): Promise<any> {
    this.logger.warn('All registered providers will be deregistered.');
    try {
      await this.deregisterWatchers();
    } catch (e: any) {
      throw new Error(`Error when trying to deregister ${e.message}`);
    }
  }

  /**
   * Register a watcher for a device when it is created
   */
  @OnEvent(Events.DEVICE_CREATED)
  async onDeviceCreated(payload: { device: IDevice }): Promise<void> {
    try {
      this.logger.log(`Device ${payload.device.uuid} created`);
      if (payload.device.agentType === SsmAgent.InstallMethods.LESS) {
        await this.registerWatcher(payload.device);
      }
    } catch (error: any) {
      this.logger.error(
        `Error when registering watcher for device ${payload.device.uuid}: ${error.message}`,
      );
    }
  }

  /**
   * Update watcher configuration when device configuration is updated
   */
  @OnEvent(Events.DEVICE_CONFIGURATION_UPDATED)
  async onDeviceConfigurationUpdated(payload: { device: IDevice }): Promise<void> {
    try {
      this.logger.log(`Device ${payload.device.uuid} configuration updated`);
      if (payload.device.agentType === SsmAgent.InstallMethods.LESS) {
        // Find and deregister the existing watcher
        const watcherKey = Object.keys(this.state.watchers).find(
          (key) => this.state.watchers[key].configuration.deviceUuid === payload.device.uuid,
        );

        if (watcherKey) {
          this.logger.log(`Deregistering existing watcher for device ${payload.device.uuid}`);
          await this.deregisterComponent(this.state.watchers[watcherKey]);
        }

        // Register a new watcher with the updated configuration
        this.logger.log(
          `Registering new watcher for device ${payload.device.uuid} with updated configuration`,
        );
        await this.registerWatcher(payload.device);
      }
    } catch (error: any) {
      this.logger.error(
        `Error when updating watcher for device ${payload.device.uuid}: ${error.message}`,
      );
    }
  }

  /**
   * Execute a specific component in debug mode
   * @param deviceUuid Device UUID
   * @param componentName Component name (e.g., 'cpu', 'mem')
   * @param debugCallback Callback for command execution details
   */
  async executeComponentInDebugMode(
    deviceUuid: string,
    componentName: string,
    debugCallback: DebugCallback,
  ): Promise<void> {
    try {
      this.logger.log(
        `Executing ${componentName} component in debug mode for device ${deviceUuid}`,
      );

      // Find the watcher for this device by looking at deviceUuid in configuration
      const watcherKeys = Object.keys(this.state.watchers);
      const watcherKey = watcherKeys.find(
        (key) => this.state.watchers[key].configuration.deviceUuid === deviceUuid,
      );

      if (!watcherKey) {
        throw new Error(`No watcher found for device ${deviceUuid}`);
      } else {
        this.logger.log(`Found watcher for device ${deviceUuid}: ${watcherKey}`);
      }

      const watcher = this.state.watchers[watcherKey];

      // Execute the component in debug mode using the watcher
      await watcher.executeComponentDebug(componentName, debugCallback);

      this.logger.log(`Successfully executed ${componentName} component in debug mode`);
    } catch (error: any) {
      this.logger.error(
        `Error executing ${componentName} component in debug mode: ${error.message}`,
      );
      throw error;
    }
  }
}
