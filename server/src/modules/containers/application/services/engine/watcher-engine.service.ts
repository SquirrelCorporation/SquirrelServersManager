import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import PinoLogger from '../../../../../logger';
import { SSMServicesTypes } from '../../../../../types/typings.d';
import { Component } from '../../../domain/components/component.interface';
import { Kind } from '../../../domain/components/kind.enum';
import { WatcherEngineServiceInterface } from '../../interfaces/watcher-engine-service.interface';
import { DevicesService } from '../../../../devices/application/services/devices.service';
import { ContainerComponentFactory } from '../components/component-factory.service';
import { WATCHERS, REGISTRIES } from '../../../constants';

const logger = PinoLogger.child({ module: 'WatcherEngineService' }, { msgPrefix: '[WATCHER_ENGINE] - ' });

/**
 * Container watchers and registries management service
 * Manages the lifecycle of container-related components
 */
@Injectable()
export class WatcherEngineService implements WatcherEngineServiceInterface, OnModuleInit, OnModuleDestroy {
  private state: {
    registry: Record<string, Component<SSMServicesTypes.ConfigurationSchema>>;
    watcher: Record<string, Component<SSMServicesTypes.ConfigurationSchema>>;
  } = {
    registry: {},
    watcher: {},
  };

  constructor(
    private readonly devicesService: DevicesService,
    private readonly componentFactory: ContainerComponentFactory,
  ) {}

  /**
   * Initialize the service when the module is loaded
   */
  async onModuleInit() {
    await this.init();
  }

  /**
   * Clean up when the module is destroyed
   */
  async onModuleDestroy() {
    await this.deregisterAll();
  }

  /**
   * Get the current state
   */
  getStates() {
    return this.state;
  }

  /**
   * Return all supported registries
   */
  getRegistries(): Component<SSMServicesTypes.ConfigurationSchema>[] {
    return Object.values(this.getStates().registry);
  }

  /**
   * Register a component
   */
  async registerComponent(
    id: string,
    kind: Kind,
    provider: string,
    name: string,
    configuration: SSMServicesTypes.ConfigurationSchema
  ): Promise<Component<SSMServicesTypes.ConfigurationSchema>> {
    const providerLowercase = provider.toLowerCase();
    const nameLowercase = name.toLowerCase();
    try {
      logger.info(`Registering "${provider}/${name}" component...`);
      
      // Create the appropriate component using the factory
      const component = this.componentFactory.createComponent(kind, providerLowercase);
      
      // Register the component with its configuration
      const componentRegistered = await component.register(
        id,
        kind,
        providerLowercase,
        nameLowercase,
        configuration,
      );
      
      // Store the component in the state
      switch (kind) {
        case Kind.WATCHER:
          this.state.watcher[componentRegistered.getId()] = componentRegistered;
          break;
        case Kind.REGISTRY:
          this.state.registry[componentRegistered.getId()] = componentRegistered;
          break;
        default:
          throw new Error(`Unknown registering component: ${componentRegistered.getId()}`);
      }
      
      return componentRegistered;
    } catch (error: any) {
      logger.error(
        `Error when registering component ${providerLowercase}/${nameLowercase} (${error.message})`,
      );
      throw error;
    }
  }

  /**
   * Register watchers from database
   */
  async registerWatchers(): Promise<boolean> {
    try {
      const dockerDevicesToWatch = await this.devicesService.getDockerDevicesToWatch();
      const proxmoxDevicesToWatch = await this.devicesService.getProxmoxDevicesToWatch();

      const watchersToRegister = [];
      
      // Register Docker watchers
      for (const device of dockerDevicesToWatch || []) {
        watchersToRegister.push(
          this.registerComponent(
            device._id,
            Kind.WATCHER,
            WATCHERS.DOCKER,
            `${WATCHERS.DOCKER}-${device.uuid}`,
            {
              cron: device.configuration.containers.docker?.watchContainersCron as string,
              watchbydefault: true,
              deviceUuid: device.uuid,
              watchstats: device.configuration.containers.docker?.watchContainersStats as boolean,
              cronstats: device.configuration.containers.docker?.watchContainersStatsCron as string,
              watchevents: device.configuration.containers.docker?.watchEvents as boolean,
              host: device.ip as string,
              watchall: device.configuration.containers.docker?.watchAll as boolean,
            },
          ),
        );
      }

      // Register Proxmox watchers
      for (const device of proxmoxDevicesToWatch || []) {
        watchersToRegister.push(
          this.registerComponent(
            device._id,
            Kind.WATCHER,
            WATCHERS.PROXMOX,
            `${WATCHERS.PROXMOX}-${device.uuid}`,
            {
              cron: device.configuration.containers.proxmox?.watchContainersCron as string,
              deviceUuid: device.uuid,
              watchbydefault: true,
              watchstats: false,
              cronstats: '' as string,
              watchevents: false,
              host: device.ip as string,
            },
          ),
        );
      }

      await Promise.all(watchersToRegister);
      return true;
    } catch (error: any) {
      logger.error(`Error when registering watchers: ${error.message}`);
      return false;
    }
  }

  /**
   * Register a single watcher
   */
  async registerWatcher(device: any): Promise<void> {
    try {
      await this.registerComponent(
        device._id,
        Kind.WATCHER,
        WATCHERS.DOCKER,
        `${WATCHERS.DOCKER}-${device.uuid}`,
        {
          cron: device.configuration.containers.docker?.watchContainersCron as string,
          watchbydefault: true,
          deviceUuid: device.uuid,
          watchstats: device.configuration.containers.docker?.watchContainersStats as boolean,
          cronstats: device.configuration.containers.docker?.watchContainersStatsCron as string,
          watchevents: device.configuration.containers.docker?.watchEvents as boolean,
          host: device.ip as string,
        },
      );
    } catch (error: any) {
      logger.warn(`Some watchers failed to register (${error.message})`);
      logger.debug(error);
      throw error;
    }
  }

  /**
   * Register registries
   */
  async registerRegistries(): Promise<void> {
    // This is a simplified implementation - you'll need to implement the actual logic
    // to fetch and register container registries from your database
    try {
      // Register default registries
      await this.registerComponent('default-docker-hub', Kind.REGISTRY, REGISTRIES.HUB, 'Docker Hub', {});
      
      // Register additional registries from database
      // const containerRegistries = await this.containerRegistriesService.listAllSetupRegistries();
      // ... register those registries
    } catch (error: any) {
      logger.warn(`Some registries failed to register (${error.message})`);
      logger.debug(error);
      throw error;
    }
  }

  /**
   * Deregister a component
   */
  async deregisterComponent(
    kind: Kind,
    component: Component<SSMServicesTypes.ConfigurationSchema>
  ): Promise<void> {
    try {
      await component.deregister();
    } catch (error: any) {
      throw new Error(
        `Error when de-registering component ${component.getId()} (error: ${error.message})`,
      );
    } finally {
      let components: Record<string, Component<SSMServicesTypes.ConfigurationSchema>> | undefined = undefined;

      switch (kind) {
        case Kind.WATCHER:
          components = this.getStates().watcher;
          break;
        case Kind.REGISTRY:
          components = this.getStates().registry;
          break;
        default:
          logger.error(`Unknown kind ${kind}`);
      }
      
      if (components) {
        delete components[component.getId()];
      }
    }
  }

  /**
   * Deregister all components of a kind
   */
  async deregisterComponents(
    kind: Kind,
    components: Component<SSMServicesTypes.ConfigurationSchema>[]
  ): Promise<void> {
    const deregisterPromises = components.map(async (component) =>
      this.deregisterComponent(kind, component),
    );
    await Promise.all(deregisterPromises);
  }

  /**
   * Deregister all registries
   */
  async deregisterRegistries(): Promise<void> {
    await this.deregisterComponents(Kind.REGISTRY, Object.values(this.getStates().registry));
  }

  /**
   * Deregister all watchers
   */
  async deregisterWatchers(): Promise<void> {
    await this.deregisterComponents(Kind.WATCHER, Object.values(this.getStates().watcher));
  }

  /**
   * Deregister all components
   */
  async deregisterAll(): Promise<void> {
    logger.warn('All registered providers will be deregistered.');
    try {
      await this.deregisterRegistries();
      await this.deregisterWatchers();
    } catch (error: any) {
      throw new Error(`Error when trying to deregister: ${error.message}`);
    }
  }

  /**
   * Initialize the service
   */
  async init(): Promise<void> {
    // Register registries
    await this.registerRegistries();
    // Register watchers
    await this.registerWatchers();
  }

  /**
   * Build a component ID
   */
  buildId(kind: Kind, provider: string, name: string): string {
    return `${kind}.${provider}.${name}`;
  }

  /**
   * Find a registered docker component
   */
  findRegisteredDockerComponent(watcher: string): Component<SSMServicesTypes.ConfigurationSchema> | undefined {
    return this.getStates().watcher[
      this.buildId(Kind.WATCHER, WATCHERS.DOCKER, watcher)
    ];
  }
}