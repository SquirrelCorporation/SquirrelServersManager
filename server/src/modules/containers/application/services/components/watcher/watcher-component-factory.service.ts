import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IProxmoxContainerRepository } from '@modules/containers/domain/repositories/proxmox-container.repository.interface';
import { PROXMOX_CONTAINER_REPOSITORY } from '@modules/containers/domain/repositories/proxmox-container.repository.interface';
import PinoLogger from '../../../../../../logger';
import { IDockerWatcherComponentFactory } from '../../../../domain/components/docker-watcher.interface';
import {
  IWatcherComponent,
  IWatcherComponentFactory,
} from '../../../../domain/components/watcher.interface';
import {
  CONTAINER_IMAGES_SERVICE,
  IContainerImagesService,
} from '../../../../domain/interfaces/container-images-service.interface';
import {
  CONTAINER_LOGS_SERVICE,
  IContainerLogsService,
} from '../../../../domain/interfaces/container-logs-service.interface';
import {
  CONTAINER_NETWORKS_SERVICE,
  IContainerNetworksService,
} from '../../../../domain/interfaces/container-networks-service.interface';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '../../../../domain/interfaces/container-service.interface';
import {
  CONTAINER_STATS_SERVICE,
  IContainerStatsService,
} from '../../../../domain/interfaces/container-stats-service.interface';
import {
  CONTAINER_VOLUMES_SERVICE,
  IContainerVolumesService,
} from '../../../../domain/interfaces/container-volumes-service.interface';
import { DockerWatcherComponentFactory } from './providers/docker/docker-watcher-factory.service';
import ProxmoxWatcherComponent from './providers/proxmox/proxmox-watcher.component';

const logger = PinoLogger.child(
  { module: 'WatcherComponentFactory' },
  { msgPrefix: '[WATCHER_FACTORY] - ' },
);

/**
 * Factory for creating watcher components
 * Follows the factory pattern to instantiate the appropriate watcher components
 */
@Injectable()
export class WatcherComponentFactory implements IWatcherComponentFactory {
  private readonly dockerWatcherFactory: IDockerWatcherComponentFactory;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService,
    @Inject(CONTAINER_STATS_SERVICE)
    private readonly containerStatsService: IContainerStatsService,
    @Inject(CONTAINER_LOGS_SERVICE)
    private readonly containerLogsService: IContainerLogsService,
    @Inject(CONTAINER_IMAGES_SERVICE)
    private readonly containerImagesService: IContainerImagesService,
    @Inject(CONTAINER_VOLUMES_SERVICE)
    private readonly containerVolumesService: IContainerVolumesService,
    @Inject(CONTAINER_NETWORKS_SERVICE)
    private readonly containerNetworksService: IContainerNetworksService,
    @Inject(PROXMOX_CONTAINER_REPOSITORY)
    private readonly proxmoxContainerRepository: IProxmoxContainerRepository,
  ) {
    // Initialize the Docker watcher factory
    this.dockerWatcherFactory = new DockerWatcherComponentFactory(
      this.eventEmitter,
      this.containerService,
      this.containerStatsService,
      this.containerLogsService,
      this.containerImagesService,
      this.containerVolumesService,
      this.containerNetworksService,
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
   * Create a Proxmox watcher component
   */
  createProxmoxComponent(): IWatcherComponent {
    logger.info('Creating Proxmox watcher component');
    return new ProxmoxWatcherComponent(
      this.eventEmitter,
      this.proxmoxContainerRepository,
      this.containerService,
    );
  }

  /**
   * Get access to the Docker watcher factory
   */
  getDockerWatcherFactory(): IDockerWatcherComponentFactory {
    return this.dockerWatcherFactory;
  }
}
