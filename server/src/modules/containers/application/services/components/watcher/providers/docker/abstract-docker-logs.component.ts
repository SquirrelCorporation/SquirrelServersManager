import * as stream from 'stream';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Dockerode from 'dockerode';
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
import { AbstractDockerImagesComponent } from './abstract-docker-images.component';

/**
 * Abstract Docker logs component for container log handling
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerLogsComponent extends AbstractDockerImagesComponent {
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
    super(
      eventEmitter,
      containerService,
      containerStatsService,
      containerLogsService,
      containerImagesService,
      containerVolumesService,
      containerNetworksService,
    );
  }

  /**
   * Fetch live logs from a Docker container
   * @param containerId - ID of the Docker container
   * @param from - Timestamp indicating the start time for fetching logs
   * @param callback - Function to handle the log data
   * @returns Function to stop the log stream
   */
  public getContainerLiveLogs(containerId: string, from: number, callback: (data: string) => void) {
    const container = (this.dockerApi as Dockerode)?.getContainer(containerId);
    if (!container) {
      throw new Error(`Container not found for ${containerId}`);
    }
    this.childLogger.info(`Fetching logs for container ${containerId}`);
    const logStream = this.createLogStream(callback);
    this.fetchLogs(container, from, logStream, containerId);
    return () => {
      logStream.end();
    };
  }

  private createLogStream(callback: (data: string) => void): stream.PassThrough {
    const logStream = new stream.PassThrough();
    logStream.on('data', (chunk) => {
      const logData = chunk.toString('utf8');
      this.childLogger.debug(logData);
      callback(logData);
    });
    return logStream;
  }

  private fetchLogs(
    container: Dockerode.Container,
    from: number,
    logStream: stream.PassThrough,
    containerId: string,
  ) {
    container.logs(
      { stderr: true, stdout: true, follow: true, since: from, timestamps: true },
      (err, logStreamResult) => {
        if (err) {
          this.childLogger.error(err.message);
          return;
        }
        if (!logStreamResult) {
          throw new Error(`Stream is null for requested containerId ${containerId}`);
        }
        logStream.push(
          `✅ Connected to container: ${container.id} on ${this.configuration.host}!\n`,
        );
        const dockerModem = (this.dockerApi as Dockerode).modem;
        dockerModem.demuxStream(logStreamResult, logStream, logStream);
        logStreamResult.on('end', () => {
          this.childLogger.info(`Logs stream for container ${containerId} ended`);
          logStream.end('!stop!');
        });
      },
    );
  }
}
