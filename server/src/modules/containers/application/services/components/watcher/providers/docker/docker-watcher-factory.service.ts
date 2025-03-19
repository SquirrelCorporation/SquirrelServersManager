import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDockerWatcherComponentFactory } from '@modules/containers/domain/components/docker-watcher.interface';
import { ContainerServiceInterface } from '@modules/containers/application/interfaces/container-service.interface';
import { ContainerStatsServiceInterface } from '@modules/containers/application/interfaces/container-stats-service.interface';
import { IContainerLogsService } from '@modules/containers/application/interfaces/container-logs-service.interface';
import { ContainerImagesServiceInterface } from '@modules/containers/application/interfaces/container-images-service.interface';
import { ContainerVolumesServiceInterface } from '@modules/containers/application/interfaces/container-volumes-service.interface';
import { ContainerNetworksServiceInterface } from '@modules/containers/application/interfaces/container-networks-service.interface';
import PinoLogger from '../../../../../../../../logger';
import { DockerWatcherComponent } from './docker-watcher.component';

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
  createDockerListenerComponent() {
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
  createDockerNetworksComponent() {
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
  createDockerVolumesComponent() {
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
  createDockerImagesComponent() {
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
  createDockerLogsComponent() {
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
  createDockerWatcherComponent() {
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