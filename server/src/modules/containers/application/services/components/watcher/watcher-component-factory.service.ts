import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import PinoLogger from '../../../../../../logger';
import { IWatcherComponent, IWatcherComponentFactory } from '../../../../domain/components/watcher.interface';
import { IDockerWatcherComponentFactory } from '../../../../domain/components/docker-watcher.interface';
import { ContainerServiceInterface } from '../../../../application/interfaces/container-service.interface';
import { ContainerStatsServiceInterface } from '../../../../application/interfaces/container-stats-service.interface';
import { IContainerLogsService } from '../../../../application/interfaces/container-logs-service.interface';
import { ContainerImagesServiceInterface } from '../../../../application/interfaces/container-images-service.interface';
import { ContainerVolumesServiceInterface } from '../../../../application/interfaces/container-volumes-service.interface';
import { ContainerNetworksServiceInterface } from '../../../../application/interfaces/container-networks-service.interface';
import { AbstractWatcherComponent } from './abstract-watcher.component';
import { DockerWatcherComponentFactory } from './providers/docker/docker-watcher-factory.service';

const logger = PinoLogger.child({ module: 'WatcherComponentFactory' }, { msgPrefix: '[WATCHER_FACTORY] - ' });

/**
 * Factory for creating watcher components
 * Follows the factory pattern to instantiate the appropriate watcher components
 */
@Injectable()
export class WatcherComponentFactory implements IWatcherComponentFactory {
  private readonly dockerWatcherFactory: IDockerWatcherComponentFactory;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly containerService: ContainerServiceInterface,
    private readonly containerStatsService: ContainerStatsServiceInterface,
    private readonly containerLogsService: IContainerLogsService,
    private readonly containerImagesService: ContainerImagesServiceInterface,
    private readonly containerVolumesService: ContainerVolumesServiceInterface,
    private readonly containerNetworksService: ContainerNetworksServiceInterface
  ) {
    // Initialize the Docker watcher factory
    this.dockerWatcherFactory = new DockerWatcherComponentFactory(
      this.eventEmitter,
      this.containerService,
      this.containerStatsService,
      this.containerLogsService,
      this.containerImagesService,
      this.containerVolumesService,
      this.containerNetworksService
    );
  }

  /**
   * Create a Docker watcher component
   */
  createDockerComponent(): IWatcherComponent {
    logger.info('Creating Docker watcher component through main factory');
    // Use the specialized Docker factory to create the Docker watcher component
    return this.dockerWatcherFactory.createDockerWatcherComponent();
  }

  /**
   * Create a Proxmox watcher component (placeholder for future implementation)
   */
  createProxmoxComponent(): IWatcherComponent {
    logger.info('Creating Proxmox watcher component (mock implementation)');

    // Return a mock implementation for Proxmox
    return new(class extends AbstractWatcherComponent {
      async init(): Promise<void> {
        this.childLogger.info('Mock Proxmox watcher initialized');
      }

      async deregisterComponent(): Promise<void> {
        this.childLogger.info('Mock Proxmox watcher deregistered');
      }

      getConfigurationSchema() {
        return this.joi.object().optional();
      }

      maskConfiguration() {
        return { ...this.configuration };
      }

      async getContainer(containerId: string): Promise<any> {
        return { id: containerId, name: 'mock-proxmox-container' };
      }

      async listContainers(): Promise<any[]> {
        return [{ id: 'mock-id', name: 'mock-proxmox-container' }];
      }

      async createContainer(): Promise<any> {
        return { id: 'new-mock-id', name: 'new-mock-proxmox-container' };
      }

      async removeContainer(): Promise<void> {}
      async startContainer(): Promise<void> {}
      async stopContainer(): Promise<void> {}
      async restartContainer(): Promise<void> {}
      async pauseContainer(): Promise<void> {}
      async unpauseContainer(): Promise<void> {}
      async killContainer(): Promise<void> {}

      async getContainerLogs(): Promise<any> {
        return 'Mock Proxmox container logs';
      }
    })();
  }

  /**
   * Get access to the Docker watcher factory
   */
  getDockerWatcherFactory(): IDockerWatcherComponentFactory {
    return this.dockerWatcherFactory;
  }
}