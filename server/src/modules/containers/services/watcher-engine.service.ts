import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import PinoLogger from '../../../logger';
import { SSMServicesTypes } from '../../../types/typings';
import Device from '../../../data/database/model/Device';
import Acr from '../registries/providers/acr/Acr';
import Custom from '../registries/providers/custom/Custom';
import Ecr from '../registries/providers/ecr/Ecr';
import Forgejo from '../registries/providers/forgejo/Forgejo';
import Gcr from '../registries/providers/gcr/Gcr';
import Ghcr from '../registries/providers/ghcr/Ghcr';
import Gitea from '../registries/providers/gitea/Gitea';
import Gitlab from '../registries/providers/gitlab/Gitlab';
import Hub from '../registries/providers/hub/Hub';
import Lscr from '../registries/providers/lscr/Lscr';
import providerConf from '../registries/providers/provider.conf';
import Quay from '../registries/providers/quay/Quay';
import Registry from '../registries/Registry';
import Docker from '../watchers/providers/docker/Docker';
import Component, { Kind } from '../core/Component';
import { REGISTRIES, WATCHERS } from '../core/conf';
import { setRegistriesGetter } from '../utils/utils';
import { ProxmoxService } from '../watchers/providers/proxmox/proxmox.service';
import { DevicesService } from '../../../modules/devices/application/services/devices.service';
import { ContainerRegistriesService } from './container-registries.service';

const logger = PinoLogger.child({ module: 'WatcherEngineService' }, { msgPrefix: '[WATCHER_ENGINE] - ' });

/**
 * Registry state.
 */
type StateType = {
  registry: Registry[];
  watcher: Docker[];
};

@Injectable()
export class WatcherEngineService implements OnModuleInit, OnModuleDestroy {
  private state: StateType = {
    registry: [],
    watcher: [],
  };

  constructor(
    private readonly containerRegistriesService: ContainerRegistriesService,
    private readonly proxmoxService: ProxmoxService,
    private readonly devicesService: DevicesService,
  ) {
    // Initialize the registriesGetter in utils.ts
    setRegistriesGetter(() => this.getRegistries());
  }

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
  getRegistries(): Registry[] {
    return this.getStates().registry;
  }

  /**
   * Get the appropriate component class based on kind and provider
   */
  private getComponentClass(
    kind: Kind,
    provider: string,
  ): Component<SSMServicesTypes.ConfigurationSchema> {
    switch (`${kind}/${provider}`) {
      case `${Kind.WATCHER}/${WATCHERS.DOCKER}`:
        return new Docker();
      case `${Kind.WATCHER}/${WATCHERS.PROXMOX}`:
        throw new Error('Proxmox is now a service and should be handled separately');
      case `${Kind.REGISTRY}/${REGISTRIES.HUB}`:
        return new Hub();
      case `${Kind.REGISTRY}/${REGISTRIES.CUSTOM}`:
        return new Custom();
      case `${Kind.REGISTRY}/${REGISTRIES.GCR}`:
        return new Gcr();
      case `${Kind.REGISTRY}/${REGISTRIES.GHCR}`:
        return new Ghcr();
      case `${Kind.REGISTRY}/${REGISTRIES.QUAY}`:
        return new Quay();
      case `${Kind.REGISTRY}/${REGISTRIES.ECR}`:
        return new Ecr();
      case `${Kind.REGISTRY}/${REGISTRIES.GITEA}`:
        return new Gitea();
      case `${Kind.REGISTRY}/${REGISTRIES.FORGEJO}`:
        return new Forgejo();
      case `${Kind.REGISTRY}/${REGISTRIES.LSCR}`:
        return new Lscr();
      case `${Kind.REGISTRY}/${REGISTRIES.GITLAB}`:
        return new Gitlab();
      case `${Kind.REGISTRY}/${REGISTRIES.ACR}`:
        return new Acr();
      default:
        throw new Error(`Unknown kind/provider: ${kind}/${provider}`);
    }
  }

  /**
   * Register a component
   */
  async registerComponent(
    _id: string,
    kind: Kind,
    provider: string,
    name: string,
    configuration: SSMServicesTypes.ConfigurationSchema,
  ) {
    const providerLowercase = provider.toLowerCase();
    const nameLowercase = name.toLowerCase();
    try {
      logger.info(`Registering "${provider}/${name}" component...`);
      const component = this.getComponentClass(kind, provider);
      const componentRegistered = await component.register(
        _id,
        kind,
        providerLowercase,
        nameLowercase,
        configuration,
      );
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
    } catch (e: any) {
      logger.error(
        `Error when registering component ${providerLowercase}/${nameLowercase} (${e.message})`,
      );
    }
  }

  /**
   * Register watchers from database
   */
  async registerWatchers(): Promise<any> {
    const dockerDevicesToWatch = await this.devicesService.getDockerDevicesToWatch();
    const proxmoxDevicesToWatch = await this.devicesService.getProxmoxDevicesToWatch();

    try {
      const watchersToRegister: any = [];
      dockerDevicesToWatch?.map((device) => {
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
      });

      await Promise.all(watchersToRegister);

      for (const device of proxmoxDevicesToWatch || []) {
        await this.proxmoxService.initialize(
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
          }
        );
      }

      return true;
    } catch (e: any) {
      logger.error(`Error when registering watchers: ${e.message}`);
      return false;
    }
  }

  /**
   * Register a single watcher
   */
  async registerWatcher(device: Device): Promise<any> {
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
    } catch (e: any) {
      logger.warn(`Some watchers failed to register (${e.message})`);
      logger.debug(e);
    }
  }

  /**
   * Register registries
   */
  async registerRegistries() {
    const containerRegistries = await this.containerRegistriesService.listAllSetupRegistries();
    const registriesToRegister: Record<string, any> = {};

    // Default anonymous registries, will be overrode if a connected one exist
    providerConf
      .filter((e) => e.default)
      .map((e) => {
        registriesToRegister[e.name] = async () =>
          this.registerComponent('default', Kind.REGISTRY, e.provider, e.name, {});
      });
    try {
      containerRegistries?.map((registry) => {
        registriesToRegister[registry.provider] = async () =>
          this.registerComponent(registry._id.toString(), Kind.REGISTRY, registry.provider, registry.name, {
            ...{
              name: registry.name,
              provider: registry.provider,
            },
            ...registry.auth,
          });
      });
      logger.info('Configuration registered will be processed...');
      await Promise.all(
        Object.values(registriesToRegister)
          .sort()
          .map((registerFn) => registerFn()),
      );
    } catch (e: any) {
      logger.warn(`Some registries failed to register (${e.message})`);
      logger.debug(e);
    }
  }

  /**
   * Deregister a component
   */
  async deregisterComponent(
    kind: Kind,
    component: Component<SSMServicesTypes.ConfigurationSchema>,
  ): Promise<any> {
    try {
      await component.deregister();
    } catch (e: any) {
      throw new Error(
        `Error when de-registering component ${component.getId()} (error: ${e.message})`,
      );
    } finally {
      let components: Registry[] | Docker[] | undefined = undefined;

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
    components: Component<SSMServicesTypes.ConfigurationSchema>[],
  ): Promise<any> {
    const deregisterPromises = components.map(async (component) =>
      this.deregisterComponent(kind, component),
    );
    return Promise.all(deregisterPromises);
  }

  /**
   * Deregister all registries
   */
  async deregisterRegistries(): Promise<any> {
    return this.deregisterComponents(Kind.REGISTRY, Object.values(this.getStates().registry));
  }

  /**
   * Deregister all watchers
   */
  async deregisterWatchers(): Promise<any> {
    return this.deregisterComponents(Kind.WATCHER, Object.values(this.getStates().watcher));
  }

  /**
   * Deregister all components
   */
  async deregisterAll(): Promise<any> {
    logger.warn('All registered providers will be deregistered.');
    try {
      await this.deregisterRegistries();
      await this.deregisterWatchers();
    } catch (e: any) {
      throw new Error(`Error when trying to deregister ${e.message}`);
    }
  }

  /**
   * Initialize the service
   */
  async init() {
    // Register registries
    await this.registerRegistries();
    // Register Watchers
    await this.registerWatchers();
    // Gracefully exit when possible is handled by onModuleDestroy
  }

  /**
   * Build a component ID
   */
  buildId(kind: Kind, provider: string, name: string) {
    return `${kind}.${provider}.${name}`;
  }

  /**
   * Find a registered docker component
   */
  findRegisteredDockerComponent(watcher: string): Docker | undefined {
    return this.getStates().watcher[
      this.buildId(Kind.WATCHER, WATCHERS.DOCKER, watcher)
    ] as Docker;
  }
}
