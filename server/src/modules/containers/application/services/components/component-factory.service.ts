import { Injectable } from '@nestjs/common';
import { Component } from '../../../domain/components/component.interface';
import { Kind } from '../../../domain/components/kind.enum';
import { SSMServicesTypes } from '../../../../../types/typings.d';
import { AbstractWatcherComponent } from './abstract-watcher.component';
import { AbstractRegistryComponent } from './abstract-registry.component';
import PinoLogger from '../../../../../logger';
import { ContainerService } from '../container.service';

// Importing concrete watcher components
import { DockerWatcherComponent } from './docker-watcher.component';
// import { ProxmoxWatcherComponent } from './proxmox-watcher.component';

// Importing concrete registry components
import { DockerHubRegistryComponent } from './docker-hub-registry.component';
import { CustomRegistryComponent } from './custom-registry.component';
import { GcrRegistryComponent } from './gcr-registry.component';
import { GhcrRegistryComponent } from './ghcr-registry.component';
import { AcrRegistryComponent } from './acr-registry.component';
import { EcrRegistryComponent } from './ecr-registry.component';
import { QuayRegistryComponent } from './quay-registry.component';
import { GitLabRegistryComponent } from './gitlab-registry.component';
import { GiteaRegistryComponent } from './gitea-registry.component';
import { ForgejoRegistryComponent } from './forgejo-registry.component';
import { LscrRegistryComponent } from './lscr-registry.component';

const logger = PinoLogger.child({ module: 'ComponentFactoryService' }, { msgPrefix: '[COMPONENT_FACTORY] - ' });

/**
 * Factory service for creating container watcher and registry components
 */
@Injectable()
export class ContainerComponentFactory {
  constructor(private readonly containerService: ContainerService) {}

  /**
   * Create a component based on kind and provider
   */
  createComponent(kind: Kind, provider: string): Component<SSMServicesTypes.ConfigurationSchema> {
    const componentKey = `${kind}/${provider}`;
    logger.info(`Creating component for ${componentKey}`);

    switch (componentKey) {
      // Watcher components
      case `${Kind.WATCHER}/docker`:
        return new DockerWatcherComponent(this.containerService);
      case `${Kind.WATCHER}/proxmox`:
        // For now, we'll use a mock component for Proxmox
        // Eventually, return new ProxmoxWatcherComponent();
        return this.createMockComponent(kind, provider);
        
      // Registry components
      case `${Kind.REGISTRY}/hub`:
        return new DockerHubRegistryComponent();
      case `${Kind.REGISTRY}/custom`:
        return new CustomRegistryComponent();
      case `${Kind.REGISTRY}/gcr`:
        return new GcrRegistryComponent();
      case `${Kind.REGISTRY}/ghcr`:
        return new GhcrRegistryComponent();
      case `${Kind.REGISTRY}/acr`:
        return new AcrRegistryComponent();
      case `${Kind.REGISTRY}/ecr`:
        return new EcrRegistryComponent();
      case `${Kind.REGISTRY}/quay`:
        return new QuayRegistryComponent();
      case `${Kind.REGISTRY}/gitlab`:
        return new GitLabRegistryComponent();
      case `${Kind.REGISTRY}/gitea`:
        return new GiteaRegistryComponent();
      case `${Kind.REGISTRY}/forgejo`:
        return new ForgejoRegistryComponent();
      case `${Kind.REGISTRY}/lscr`:
        return new LscrRegistryComponent();
        
      default:
        logger.warn(`No concrete implementation found for ${componentKey}, using mock implementation`);
        return this.createMockComponent(kind, provider);
    }
  }

  /**
   * Create a mock component for testing/placeholder purposes
   * This will be removed when concrete implementations are ready
   */
  private createMockComponent(kind: Kind, provider: string): Component<SSMServicesTypes.ConfigurationSchema> {
    if (kind === Kind.WATCHER) {
      return new (class extends AbstractWatcherComponent {
        protected async setup(): Promise<void> {
          logger.info(`Mock setup for ${provider} watcher`);
        }
        
        protected async cleanup(): Promise<void> {
          logger.info(`Mock cleanup for ${provider} watcher`);
        }
        
        protected async onConfigurationUpdated(): Promise<void> {
          logger.info(`Mock configuration update for ${provider} watcher`);
        }
        
        async getContainer(containerId: string): Promise<any> {
          return { id: containerId, name: 'mock-container' };
        }
        
        async listContainers(): Promise<any[]> {
          return [{ id: 'mock-id', name: 'mock-container' }];
        }
        
        async createContainer(): Promise<any> {
          return { id: 'new-mock-id', name: 'new-mock-container' };
        }
        
        async removeContainer(): Promise<void> {}
        async startContainer(): Promise<void> {}
        async stopContainer(): Promise<void> {}
        async restartContainer(): Promise<void> {}
        async pauseContainer(): Promise<void> {}
        async unpauseContainer(): Promise<void> {}
        async killContainer(): Promise<void> {}
        
        async getContainerLogs(): Promise<any> {
          return 'Mock container logs';
        }
      })();
    } else {
      return new (class extends AbstractRegistryComponent {
        protected async setup(): Promise<void> {
          logger.info(`Mock setup for ${provider} registry`);
        }
        
        protected async cleanup(): Promise<void> {
          logger.info(`Mock cleanup for ${provider} registry`);
        }
        
        protected async onConfigurationUpdated(): Promise<void> {
          logger.info(`Mock configuration update for ${provider} registry`);
        }
        
        async listImages(): Promise<any[]> {
          return [{ name: 'mock-image', tag: 'latest' }];
        }
        
        async searchImages(): Promise<any[]> {
          return [{ name: 'mock-image', tag: 'latest' }];
        }
        
        async getImageInfo(): Promise<any> {
          return { name: 'mock-image', tag: 'latest', size: '100MB' };
        }
        
        async testConnection(): Promise<boolean> {
          return true;
        }
      })();
    }
  }
}