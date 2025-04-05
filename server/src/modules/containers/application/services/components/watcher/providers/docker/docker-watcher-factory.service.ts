import { IDockerWatcherComponentFactory } from '@modules/containers/domain/components/docker-watcher.interface';
import { IContainerImagesService } from '@modules/containers/domain/interfaces/container-images-service.interface';
import { IContainerLogsService } from '@modules/containers/domain/interfaces/container-logs-service.interface';
import { IContainerNetworksService } from '@modules/containers/domain/interfaces/container-networks-service.interface';
import { IContainerService } from '@modules/containers/domain/interfaces/container-service.interface';
import { IContainerStatsService } from '@modules/containers/domain/interfaces/container-stats-service.interface';
import { IContainerVolumesService } from '@modules/containers/domain/interfaces/container-volumes-service.interface';
import {
  DEVICES_SERVICE,
  IDevicesService,
} from '@modules/devices/domain/interfaces/devices-service.interface';
import {
  DEVICE_AUTH_SERVICE,
  IDeviceAuthService,
} from '@modules/devices/domain/services/device-auth-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
    @Inject(DEVICES_SERVICE) private readonly devicesService: IDevicesService,
    @Inject(DEVICE_AUTH_SERVICE)
    private readonly deviceAuthService: IDeviceAuthService,
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
      this.containerNetworksService,
      this.devicesService,
      this.deviceAuthService,
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
      this.containerNetworksService,
      this.devicesService,
      this.deviceAuthService,
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
      this.containerNetworksService,
      this.devicesService,
      this.deviceAuthService,
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
      this.containerNetworksService,
      this.devicesService,
      this.deviceAuthService,
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
      this.containerNetworksService,
      this.devicesService,
      this.deviceAuthService,
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
      this.containerNetworksService,
      this.devicesService,
      this.deviceAuthService,
    );
  }
}
