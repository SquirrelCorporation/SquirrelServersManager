import * as stream from 'stream';
import { Injectable } from '@nestjs/common';
import * as Dockerode from 'dockerode';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContainerServiceInterface } from '../../../../../../application/interfaces/container-service.interface';
import { ContainerStatsServiceInterface } from '../../../../../../application/interfaces/container-stats-service.interface';
import { IContainerLogsService } from '../../../../../../application/interfaces/container-logs-service.interface';
import { ContainerImagesServiceInterface } from '../../../../../../application/interfaces/container-images-service.interface';
import { ContainerVolumesServiceInterface } from '../../../../../../application/interfaces/container-volumes-service.interface';
import { ContainerNetworksServiceInterface } from '../../../../../../application/interfaces/container-networks-service.interface';
import { AbstractDockerImagesComponent } from './abstract-docker-images.component';
import { IDockerLogsComponent } from '../../../../../../../../domain/components/docker-watcher.interface';

/**
 * Abstract Docker logs component for container log handling
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerLogsComponent extends AbstractDockerImagesComponent implements IDockerLogsComponent {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly containerService: ContainerServiceInterface,
    protected readonly containerStatsService: ContainerStatsServiceInterface,
    protected readonly containerLogsService: IContainerLogsService,
    protected readonly containerImagesService: ContainerImagesServiceInterface,
    protected readonly containerVolumesService: ContainerVolumesServiceInterface,
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

  /**
   * Get container logs
   * Implements IDockerLogsComponent.getContainerLogs()
   * @param container - Container object or container ID string
   * @param options - Log options (timestamps, tail, etc.)
   */
  async getContainerLogs(container: any, options: any = {}): Promise<any> {
    try {
      const containerId = typeof container === 'string' ? container : container.id;
      this.childLogger.info(`Getting logs for container ${containerId}`);
      const dockerContainer = this.dockerApi.getContainer(containerId);

      const logOptions: Dockerode.ContainerLogsOptions = {
        stdout: true,
        stderr: true,
        follow: false,
        timestamps: options.timestamps || false,
        tail: options.tail !== undefined ? options.tail.toString() : 'all'
      };

      const logs = await dockerContainer.logs(logOptions);
      return logs.toString();
    } catch (error: any) {
      const containerId = typeof container === 'string' ? container : container.id;
      this.childLogger.error(`Failed to get logs for container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stream container logs in real-time
   * Implements IDockerLogsComponent.streamContainerLogs()
   * @param container - Container object or container ID string
   * @param options - Stream options
   */
  async streamContainerLogs(container: any, options: any = {}): Promise<any> {
    try {
      const containerId = typeof container === 'string' ? container : container.id;
      const from = options.from || 0;
      const callback = options.callback || (() => {});
      
      const dockerContainer = this.dockerApi.getContainer(containerId);
      if (!dockerContainer) {
        throw new Error(`Container not found for ${containerId}`);
      }

      this.childLogger.info(`Streaming logs for container ${containerId}`);

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

      // Return the stream controller
      return {
        stream: logStream,
        stop: () => {
          logStream.end();
        }
      };
    } catch (error: any) {
      this.childLogger.error(`Error setting up live logs: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Legacy method for backward compatibility
   * @deprecated Use streamContainerLogs instead
   */
  public getContainerLiveLogs(containerId: string, from: number, callback: (data: string) => void): () => void {
    try {
      const stream = this.streamContainerLogs(containerId, { from, callback });
      return () => {
        if (stream && typeof stream.then === 'function') {
          stream.then(result => {
            if (result && result.stop) {
              result.stop();
            }
          });
        }
      };
    } catch (error: any) {
      this.childLogger.error(`Error setting up live logs: ${error.message}`);
      callback(`Error setting up live logs: ${error.message}`);
      return () => {}; // Return empty function as fallback
    }
  }
}