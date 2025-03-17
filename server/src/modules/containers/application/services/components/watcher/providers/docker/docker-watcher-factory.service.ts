import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  IDockerListenerComponent, 
  IDockerNetworksComponent, 
  IDockerVolumesComponent, 
  IDockerImagesComponent, 
  IDockerLogsComponent,
  IDockerWatcherComponentFactory 
} from '../../../../../../../../domain/components/docker-watcher.interface';
import { ContainerServiceInterface } from '../../../../../../interfaces/container-service.interface';
import { ContainerStatsServiceInterface } from '../../../../../../interfaces/container-stats-service.interface';
import { IContainerLogsService } from '../../../../../../interfaces/container-logs-service.interface';
import { ContainerImagesServiceInterface } from '../../../../../../interfaces/container-images-service.interface';
import { ContainerVolumesServiceInterface } from '../../../../../../interfaces/container-volumes-service.interface';
import { ContainerNetworksServiceInterface } from '../../../../../../interfaces/container-networks-service.interface';
import { DockerWatcherComponent } from './docker-watcher.component';
import PinoLogger from '../../../../../../../../logger';

const logger = PinoLogger.child({ module: 'DockerWatcherFactory' }, { msgPrefix: '[DOCKER_FACTORY] - ' });

/**
 * Factory for creating different levels of Docker watcher components
 * Implementation of the factory pattern that allows creating different Docker watcher components
 */
@Injectable()
export class DockerWatcherComponentFactory implements IDockerWatcherComponentFactory {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly containerService: ContainerServiceInterface,
    private readonly containerStatsService: ContainerStatsServiceInterface,
    private readonly containerLogsService: IContainerLogsService,
    private readonly containerImagesService: ContainerImagesServiceInterface,
    private readonly containerVolumesService: ContainerVolumesServiceInterface,
    private readonly containerNetworksService: ContainerNetworksServiceInterface
  ) {}

  /**
   * Create a Docker listener component
   */
  createDockerListenerComponent(): IDockerListenerComponent {
    logger.info('Creating Docker listener component');
    return new DockerWatcherComponent(
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
   * Create a Docker networks component
   */
  createDockerNetworksComponent(): IDockerNetworksComponent {
    logger.info('Creating Docker networks component');
    return new DockerWatcherComponent(
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
   * Create a Docker volumes component
   */
  createDockerVolumesComponent(): IDockerVolumesComponent {
    logger.info('Creating Docker volumes component');
    return new DockerWatcherComponent(
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
   * Create a Docker images component
   */
  createDockerImagesComponent(): IDockerImagesComponent {
    logger.info('Creating Docker images component');
    return new DockerWatcherComponent(
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
   * Create a Docker logs component
   */
  createDockerLogsComponent(): IDockerLogsComponent {
    logger.info('Creating Docker logs component');
    return new DockerWatcherComponent(
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
   * Create a complete Docker watcher component
   */
  createDockerWatcherComponent(): IDockerLogsComponent {
    logger.info('Creating full Docker watcher component');
    return new DockerWatcherComponent(
      this.eventEmitter,
      this.containerService,
      this.containerStatsService,
      this.containerLogsService,
      this.containerImagesService,
      this.containerVolumesService,
      this.containerNetworksService
    );
  }
}