import * as stream from 'stream';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CONTAINER_SERVICE, ContainerServiceInterface } from '../../../../../../application/interfaces/container-service.interface';
import { CONTAINER_STATS_SERVICE, ContainerStatsServiceInterface } from '../../../../../../application/interfaces/container-stats-service.interface';
import { CONTAINER_LOGS_SERVICE, IContainerLogsService } from '../../../../../../application/interfaces/container-logs-service.interface';
import { CONTAINER_IMAGES_SERVICE, ContainerImagesServiceInterface } from '../../../../../../application/interfaces/container-images-service.interface';
import { CONTAINER_VOLUMES_SERVICE, ContainerVolumesServiceInterface } from '../../../../../../application/interfaces/container-volumes-service.interface';
import { CONTAINER_NETWORKS_SERVICE, ContainerNetworksServiceInterface } from '../../../../../../application/interfaces/container-networks-service.interface';
import { AbstractDockerImagesComponent } from './abstract-docker-images.component';

/**
 * Abstract Docker logs component for container log handling
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerLogsComponent extends AbstractDockerImagesComponent implements IContainerLogsService {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    @Inject(CONTAINER_SERVICE)
    protected readonly containerService: ContainerServiceInterface,
    @Inject(CONTAINER_STATS_SERVICE)
    protected readonly containerStatsService: ContainerStatsServiceInterface,
    @Inject(CONTAINER_LOGS_SERVICE)
    protected readonly containerLogsService: IContainerLogsService,
    @Inject(CONTAINER_IMAGES_SERVICE)
    protected readonly containerImagesService: ContainerImagesServiceInterface,
    @Inject(CONTAINER_VOLUMES_SERVICE)
    protected readonly containerVolumesService: ContainerVolumesServiceInterface,
    @Inject(CONTAINER_NETWORKS_SERVICE)
    protected readonly containerNetworksService: ContainerNetworksServiceInterface
  ) {
    super(
      eventEmitter,
      containerService,
      containerStatsService,
      containerLogsService,
      containerImagesService,
      containerVolumesService,
      containerNetworksService
    );
  }

  public getContainerLiveLogs(containerId: string, from: number, callback: (data: string) => void): any {
    try {
      this.childLogger.info(`Getting live logs for container ${containerId}`);
      const dockerContainer = this.dockerApi.getContainer(containerId);
      if (!dockerContainer) {
        throw new Error(`Container not found for ${containerId}`);
      }

      // Create a PassThrough stream to handle the log data
      const logStream = new stream.PassThrough();
      logStream.on('data', (chunk) => {
        const logData = chunk.toString('utf8');
        this.childLogger.debug(logData);
        callback(logData);
      });

      // Fetch logs with the Docker API
      dockerContainer.logs(
        { stderr: true, stdout: true, follow: true, since: from, timestamps: true },
        (err: any, logStreamResult: any) => {
          if (err) {
            this.childLogger.error(`Failed to get logs for container ${containerId}: ${err.message}`);
            callback(`Error fetching logs: ${err.message}`);
            return;
          }

          if (!logStreamResult) {
            callback(`Stream is null for requested containerId ${containerId}`);
            throw new Error(`Stream is null for requested containerId ${containerId}`);
          }

          // Connected message
          logStream.push(`✅ Connected to container: ${containerId} on ${this.configuration.host}!\n`);

          // Demux the Docker stream to our PassThrough stream
          this.dockerApi.modem.demuxStream(logStreamResult, logStream, logStream);

          // Handle stream end
          logStreamResult.on('end', () => {
            this.childLogger.info(`Logs stream for container ${containerId} ended`);
            logStream.end('!stop!');
          });
        }
      );

      // Return the stop function
      return () => {
        this.childLogger.info(`Stopping log stream for container ${containerId}`);
        logStream.end();
      };
    } catch (error: any) {
      this.childLogger.error(`Error setting up live logs: ${error.message}`);
      callback(`Error setting up live logs: ${error.message}`);
      return () => {}; // Return empty function as fallback
    }
  }
}