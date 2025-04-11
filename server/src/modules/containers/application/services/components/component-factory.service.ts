import { Injectable } from '@nestjs/common';
import { ConfigurationSchema } from '@modules/containers/types';
import { IComponent } from '../../../domain/components/component.interface';
import { Kind } from '../../../domain/components/kind.enum';
import PinoLogger from '../../../../../logger';
import { IWatcherComponentFactory } from '../../../domain/components/watcher.interface';
import { REGISTRIES, WATCHERS } from '../../../constants';
import { DockerHubRegistryComponent } from './registry/docker-hub-registry.component';
import { CustomRegistryComponent } from './registry/custom-registry.component';
import { GcrRegistryComponent } from './registry/gcr-registry.component';
import { GhcrRegistryComponent } from './registry/ghcr-registry.component';
import { AcrRegistryComponent } from './registry/acr-registry.component';
import { EcrRegistryComponent } from './registry/ecr-registry.component';
import { QuayRegistryComponent } from './registry/quay-registry.component';
import { GitLabRegistryComponent } from './registry/gitlab-registry.component';
import { GiteaRegistryComponent } from './registry/gitea-registry.component';
import { ForgejoRegistryComponent } from './registry/forgejo-registry.component';
import { LscrRegistryComponent } from './registry/lscr-registry.component';
import { AbstractRegistryComponent } from './registry/abstract-registry.component';

const logger = PinoLogger.child(
  { module: 'ComponentFactoryService' },
  { msgPrefix: '[COMPONENT_FACTORY] - ' },
);

/**
 * Factory service for creating container components
 * Follows the playbooks module pattern, using specialized factories for different component types
 */
@Injectable()
export class ContainerComponentFactory {
  constructor(
    // Registry components
    private readonly dockerHubRegistry: DockerHubRegistryComponent,
    private readonly customRegistry: CustomRegistryComponent,
    private readonly gcrRegistry: GcrRegistryComponent,
    private readonly ghcrRegistry: GhcrRegistryComponent,
    private readonly acrRegistry: AcrRegistryComponent,
    private readonly ecrRegistry: EcrRegistryComponent,
    private readonly quayRegistry: QuayRegistryComponent,
    private readonly gitlabRegistry: GitLabRegistryComponent,
    private readonly giteaRegistry: GiteaRegistryComponent,
    private readonly forgejoRegistry: ForgejoRegistryComponent,
    private readonly lscrRegistry: LscrRegistryComponent,

    // Watcher factory - specialized factory for watcher components
    private readonly watcherFactory: IWatcherComponentFactory,
  ) {}

  /**
   * Create a component based on kind and provider
   * Uses specialized factories for different component types
   */
  createComponent(kind: Kind, provider: string): IComponent<ConfigurationSchema> {
    const componentKey = `${kind}/${provider}`;
    logger.info(`Creating component for ${componentKey}`);

    // Delegate watcher component creation to specialized WatcherComponentFactory
    if (kind === Kind.WATCHER) {
      switch (provider) {
        case WATCHERS.DOCKER:
          return this.watcherFactory.createDockerComponent();
        case WATCHERS.PROXMOX:
          return this.watcherFactory.createProxmoxComponent();
        default:
          logger.warn(
            `No concrete implementation found for watcher provider: ${provider}, using mock component`,
          );
          return this.watcherFactory.createProxmoxComponent(); // Use mock implementation
      }
    }

    // Handle registry component creation directly
    if (kind === Kind.REGISTRY) {
      switch (provider) {
        case REGISTRIES.HUB:
          return this.dockerHubRegistry;
        case REGISTRIES.CUSTOM:
          return this.customRegistry;
        case REGISTRIES.GCR:
          return this.gcrRegistry;
        case REGISTRIES.GHCR:
          return this.ghcrRegistry;
        case REGISTRIES.ACR:
          return this.acrRegistry;
        case REGISTRIES.ECR:
          return this.ecrRegistry;
        case REGISTRIES.QUAY:
          return this.quayRegistry;
        case REGISTRIES.GITLAB:
          return this.gitlabRegistry;
        case REGISTRIES.GITEA:
          return this.giteaRegistry;
        case REGISTRIES.FORGEJO:
          return this.forgejoRegistry;
        case REGISTRIES.LSCR:
          return this.lscrRegistry;
        default:
          logger.warn(
            `No concrete implementation found for registry provider: ${provider}, using mock registry`,
          );
          return this.createMockRegistryComponent(provider);
      }
    }

    logger.warn(`Unknown component kind: ${kind}, provider: ${provider}`);
    throw new Error(`Unknown component kind: ${kind}`);
  }

  /**
   * Create a mock registry component for testing/placeholder purposes
   */
  private createMockRegistryComponent(provider: string): IComponent<ConfigurationSchema> {
    logger.info(`Creating mock registry component for provider: ${provider}`);
    return new(class extends AbstractRegistryComponent {
      async init(): Promise<void> {
        logger.info(`Mock setup for ${provider} registry`);
      }

      getConfigurationSchema() {
        return this.joi.object().optional();
      }

      maskConfiguration() {
        return { ...this.configuration };
      }
    })();
  }
}
