import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDockerWatcherComponentFactory } from '@modules/containers/domain/components/docker-watcher.interface';
import { IContainerService } from '@modules/containers/domain/interfaces/container-service.interface';
import { IContainerStatsService } from '@modules/containers/domain/interfaces/container-stats-service.interface';
import { IContainerLogsService } from '@modules/containers/domain/interfaces/container-logs-service.interface';
import { IContainerImagesService } from '@modules/containers/domain/interfaces/container-images-service.interface';
import { IContainerVolumesService } from '@modules/containers/domain/interfaces/container-volumes-service.interface';
import { IContainerNetworksService } from '@modules/containers/domain/interfaces/container-networks-service.interface';
import PinoLogger from '../../../../../../../../logger';
import { DockerWatcherComponent } from './docker-watcher.component';

const logger = PinoLogger.child(
  { module: 'DockerWatcherFactory' },
  { msgPrefix: '[DOCKER_FACTORY] - ' },
);

/**
 * Factory for creating different levels of Docker watcher components
 * Implementation of the factory pattern that allows creating different Docker watcher components
 */
@Injectable()
export class DockerWatcherComponentFactory implements IDockerWatcherComponentFactory {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly containerService: IContainerService,
    private readonly containerStatsService: IContainerStatsService,
    private readonly containerLogsService: IContainerLogsService,
    private readonly containerImagesService: IContainerImagesService,
    private readonly containerVolumesService: IContainerVolumesService,
    private readonly containerNetworksService: IContainerNetworksService,
  ) {}

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
      this.containerNetworksService,
    );
  }
}
