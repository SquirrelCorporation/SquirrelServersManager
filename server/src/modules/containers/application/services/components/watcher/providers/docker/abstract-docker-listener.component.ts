import { Inject, Injectable } from '@nestjs/common';
import * as Dockerode from 'dockerode';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AbstractWatcherComponent } from '../../abstract-watcher.component';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '../../../../../../application/interfaces/container-service.interface';
import {
  CONTAINER_STATS_SERVICE,
  IContainerStatsService,
} from '../../../../../../application/interfaces/container-stats-service.interface';
import {
  CONTAINER_LOGS_SERVICE,
  IContainerLogsService,
} from '../../../../../../application/interfaces/container-logs-service.interface';
import {
  CONTAINER_IMAGES_SERVICE,
  IContainerImagesService,
} from '../../../../../../application/interfaces/container-images-service.interface';
import {
  CONTAINER_VOLUMES_SERVICE,
  IContainerVolumesService,
} from '../../../../../../application/interfaces/container-volumes-service.interface';
import {
  CONTAINER_NETWORKS_SERVICE,
  IContainerNetworksService,
} from '../../../../../../application/interfaces/container-networks-service.interface';

/**
 * Abstract Docker listener component that provides base functionality for Docker event monitoring
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerListenerComponent extends AbstractWatcherComponent {
  protected dockerApi!: Dockerode;
  protected watchCronDebounced: any;

  constructor(
    protected readonly eventEmitter: EventEmitter2,
    @Inject(CONTAINER_SERVICE)
    protected readonly containerService: IContainerService,
    @Inject(CONTAINER_STATS_SERVICE)
    protected readonly containerStatsService: IContainerStatsService,
    @Inject(CONTAINER_LOGS_SERVICE)
    protected readonly containerLogsService: IContainerLogsService,
    @Inject(CONTAINER_IMAGES_SERVICE)
    protected readonly containerImagesService: IContainerImagesService,
    @Inject(CONTAINER_VOLUMES_SERVICE)
    protected readonly containerVolumesService: IContainerVolumesService,
    @Inject(CONTAINER_NETWORKS_SERVICE)
    protected readonly containerNetworksService: IContainerNetworksService,
  ) {
    super();
  }

  /**
   * Listen and react to docker events.
   */
  // This needs to be public to implement the IDockerListenerComponent interface
  public async listenDockerEvents(): Promise<void> {
    this.childLogger.info(
      `Listening to docker events - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );

    const options: Dockerode.GetEventsOptions = {
      filters: {
        type: ['container'],
        event: ['create', 'destroy', 'start', 'stop', 'pause', 'unpause', 'die', 'update'],
      },
    };

    try {
      this.dockerApi.getEvents(options, (err, stream) => {
        if (err) {
          this.childLogger.warn(
            `Unable to listen to Docker events [${err.message}] - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
          );
          this.childLogger.debug(err);
        } else {
          stream?.on('data', (chunk) => this.onDockerEvent(chunk));
        }
      });
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }

  /**
   * Process a docker event.
   */
  protected async onDockerEvent(dockerEventChunk: any): Promise<void> {
    this.childLogger.debug('onDockerEvent');

    const dockerEvent = JSON.parse(dockerEventChunk.toString());
    const action = dockerEvent.Action;
    const containerId = dockerEvent.id;

    this.childLogger.info(
      `onDockerEvent (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}, action received: "${action}", containerId: ${containerId})`,
    );

    // If the container was created or destroyed => perform a watch
    if (action === 'destroy' || action === 'create') {
      if (this.watchCronDebounced && typeof this.watchCronDebounced === 'function') {
        await this.watchCronDebounced();
      }
    } else {
      // Update container state in db if it exists
      try {
        const container = this.dockerApi.getContainer(containerId);
        const containerInspect = await container.inspect();
        const newStatus = containerInspect.State.Status;

        // Find container in the database
        const containers = await this.containerService.getContainersByDeviceUuid(
          this.configuration.deviceUuid,
        );
        const containerFound = containers.find((c) => c.id === containerId);

        if (containerFound) {
          this.childLogger.debug(JSON.stringify(containerInspect));

          const oldStatus = containerFound.status;

          if (oldStatus !== newStatus) {
            // Update container status
            await this.containerService.updateContainer(containerFound.id, {
              ...containerFound,
              status: newStatus,
            });

            this.childLogger.info(
              `[${containerFound.name}] Status changed from ${oldStatus} to ${newStatus} - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
            );

            // Emit event for status change
            this.emit('container.updated', 'Updated containers');
          }
        }
      } catch (error: any) {
        this.childLogger.debug(`Unable to get container details for container id=[${containerId}]`);
        this.childLogger.debug(error);
      }
    }
  }

  /**
   * Override emit to use EventEmitter2
   */
  protected emit(event: string, data: any): void {
    this.childLogger.debug(`Emitting event ${event}`);
    this.eventEmitter.emit(event, data);
  }
}
