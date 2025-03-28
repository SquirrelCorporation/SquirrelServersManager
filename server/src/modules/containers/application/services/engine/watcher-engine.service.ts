import { Inject, Injectable, OnModuleDestroy, OnModuleInit, forwardRef } from '@nestjs/common';
import {
  ConfigurationRegistrySchema,
  ConfigurationSchema,
  ConfigurationWatcherSchema,
} from '@modules/containers/types';
import { Kind } from '@modules/containers/domain/components/kind.enum';
import { REGISTRIES, WATCHERS } from '@modules/containers/constants';
import { IRegistryComponent } from '@modules/containers/domain/components/registry.interface';
import { IWatcherComponent } from '@modules/containers/domain/components/watcher.interface';
import {
  AbstractRegistryComponent,
  AbstractWatcherComponent,
  IComponent,
} from '@modules/containers';
import PinoLogger from '../../../../../logger';
import {
  IWatcherEngineService,
  StateType,
} from '../../interfaces/watcher-engine-service.interface';
import { RegistryComponentFactory } from '../components/registry/registry-component-factory.service';
import { DOCKER_DEVICE_SERVICE } from '../../../../devices/domain/services/docker-device-service.interface';
import { IDockerDeviceService } from '../../../../devices/domain/services/docker-device-service.interface';
import { PROXMOX_DEVICE_SERVICE } from '../../../../devices/domain/services/proxmox-device-service.interface';
import { IProxmoxDeviceService } from '../../../../devices/domain/services/proxmox-device-service.interface';
import { WatcherComponentFactory } from '../components/watcher/watcher-component-factory.service';
import {
  CONTAINER_REGISTRIES_SERVICE,
  IContainerRegistriesService,
} from '../../interfaces/container-registries-service.interface';

const logger = PinoLogger.child(
  { module: 'WatcherEngineService' },
  { msgPrefix: '[WATCHER_ENGINE] - ' },
);

/**
 * Container watchers and registries management service
 * Manages the lifecycle of container-related components
 * Uses specialized factories for creating different component types
 */
@Injectable()
export class WatcherEngineService implements IWatcherEngineService, OnModuleInit, OnModuleDestroy {
  private state: StateType = {
    registry: {},
    watcher: {},
  };

  constructor(
    @Inject(DOCKER_DEVICE_SERVICE)
    private readonly dockerDeviceService: IDockerDeviceService,
    @Inject(PROXMOX_DEVICE_SERVICE)
    private readonly proxmoxDeviceService: IProxmoxDeviceService,
    private readonly registryFactory: RegistryComponentFactory,
    private readonly watcherFactory: WatcherComponentFactory,
    @Inject(forwardRef(() => CONTAINER_REGISTRIES_SERVICE))
    private readonly containerRegistriesService: IContainerRegistriesService,
  ) {}

  /**
   * Initialize the service when the module is loaded
   */
  async onModuleInit() {
    void this.init();
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
  getStates(): StateType {
    return this.state;
  }

  /**
   * Return all supported registries
   */
  getRegistries(): IComponent<ConfigurationSchema>[] {
    return Object.values(this.getStates().registry);
  }

  /**
   * Register a component
   * Uses specialized factories for different component types
   */
  async registerComponent(
    id: string,
    kind: Kind,
    provider: string,
    name: string,
    configuration: ConfigurationSchema,
  ): Promise<IComponent<ConfigurationSchema>> {
    const providerLowercase = provider.toLowerCase();
    const nameLowercase = name.toLowerCase();
    try {
      logger.info(`Registering "${provider}/${name}" component...`);

      // Create the appropriate component using the specialized factories
      let component: IWatcherComponent | IRegistryComponent;

      if (kind === Kind.WATCHER) {
        // Use the specialized watcher factory for watcher components
        switch (providerLowercase) {
          case WATCHERS.DOCKER:
            component = this.watcherFactory.createDockerComponent();
            break;
          case WATCHERS.PROXMOX:
            component = this.watcherFactory.createProxmoxComponent();
            break;
          default:
            throw new Error(`Unknown watcher provider: ${providerLowercase}`);
        }
      } else if (kind === Kind.REGISTRY) {
        // Use the specialized registry factory for registry components
        switch (providerLowercase) {
          case REGISTRIES.HUB:
            component = this.registryFactory.createDockerHubComponent();
            break;
          case REGISTRIES.CUSTOM:
            component = this.registryFactory.createCustomComponent();
            break;
          case REGISTRIES.GCR:
            component = this.registryFactory.createGcrComponent();
            break;
          case REGISTRIES.GHCR:
            component = this.registryFactory.createGhcrComponent();
            break;
          case REGISTRIES.ACR:
            component = this.registryFactory.createAcrComponent();
            break;
          case REGISTRIES.ECR:
            component = this.registryFactory.createEcrComponent();
            break;
          case REGISTRIES.QUAY:
            component = this.registryFactory.createQuayComponent();
            break;
          case REGISTRIES.GITLAB:
            component = this.registryFactory.createGitLabComponent();
            break;
          case REGISTRIES.GITEA:
            component = this.registryFactory.createGiteaComponent();
            break;
          case REGISTRIES.FORGEJO:
            component = this.registryFactory.createForgejoComponent();
            break;
          case REGISTRIES.LSCR:
            component = this.registryFactory.createLscrComponent();
            break;
          default:
            throw new Error(`Unknown registry provider: ${providerLowercase}`);
        }
      } else {
        throw new Error(`Unknown component kind: ${kind}`);
      }

      // Register the component with its configuration
      const componentRegistered = await component.register(
        id,
        kind,
        providerLowercase,
        nameLowercase,
        configuration as ConfigurationWatcherSchema & ConfigurationRegistrySchema,
      );

      // Store the component in the state
      switch (kind) {
        case Kind.WATCHER:
          this.state.watcher[componentRegistered.getId()] =
            componentRegistered as AbstractWatcherComponent;
          break;
        case Kind.REGISTRY:
          this.state.registry[componentRegistered.getId()] =
            componentRegistered as AbstractRegistryComponent;
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
      const dockerDevicesToWatch = await this.dockerDeviceService.getDockerDevicesToWatch();
      const proxmoxDevicesToWatch = await this.proxmoxDeviceService.getProxmoxDevicesToWatch();

      const watchersToRegister: any[] = [];

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
    try {
      // Register Docker Hub registry by default (can be anonymous)
      await this.registerComponent(
        'default-docker-hub',
        Kind.REGISTRY,
        REGISTRIES.HUB,
        'Docker Hub',
        {},
      );

      // Register all registries that have authentication set up in the database
      const registries = await this.containerRegistriesService.listAllSetupRegistries();
      logger.info(`Registering ${registries.length} registries`);
      for (const registry of registries) {
        // Skip Docker Hub as it's already registered by default
        if (registry.provider === REGISTRIES.HUB) {
          continue;
        }

        await this.registerComponent(
          registry._id as string,
          Kind.REGISTRY,
          registry.provider,
          registry.name,
          registry.auth || {}, // Pass the stored authentication details
        );
      }
    } catch (error: any) {
      logger.warn(`Some registries failed to register (${error.message})`);
      logger.debug(error);
      throw error;
    }
  }

  /**
   * Deregister a component
   */
  async deregisterComponent(kind: Kind, component: IComponent<ConfigurationSchema>): Promise<void> {
    try {
      await component.deregister();
    } catch (error: any) {
      throw new Error(
        `Error when de-registering component ${component.getId()} (error: ${error.message})`,
      );
    } finally {
      let components: Record<string, IComponent<ConfigurationSchema>> | undefined = undefined;

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
    components: IComponent<ConfigurationSchema>[],
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
  findRegisteredDockerComponent(watcher: string): IComponent<ConfigurationSchema> | undefined {
    return this.getStates().watcher[this.buildId(Kind.WATCHER, WATCHERS.DOCKER, watcher)];
  }
}
