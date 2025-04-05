import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  CONTAINER_IMAGES_SERVICE,
  IContainerImagesService
} from '../../../../../../applicati../../domain/interfaces/container-images-service.interface';
import {
  CONTAINER_LOGS_SERVICE,
  IContainerLogsService
} from '../../../../../../applicati../../domain/interfaces/container-logs-service.interface';
import {
  CONTAINER_NETWORKS_SERVICE,
  IContainerNetworksService
} from '../../../../../../applicati../../domain/interfaces/container-networks-service.interface';
import {
  CONTAINER_SERVICE,
  IContainerService
} from '../../../../../../applicati../../domain/interfaces/container-service.interface';
import {
  CONTAINER_STATS_SERVICE,
  IContainerStatsService
} from '../../../../../../applicati../../domain/interfaces/container-stats-service.interface';
import {
  CONTAINER_VOLUMES_SERVICE,
  IContainerVolumesService
} from '../../../../../../applicati../../domain/interfaces/container-volumes-service.interface';
import { AbstractDockerNetworksComponent } from './abstract-docker-networks.component';

/**
 * Abstract Docker volumes component for volume management
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerVolumesComponent extends AbstractDockerNetworksComponent {
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
   * Watch volumes from cron job
   */
  protected async watchVolumesFromCron(): Promise<void> {
    this.childLogger.info(
      `watchVolumesFromCron - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );

    try {
      // Get current volumes from Docker
      const rawVolumes = await this.dockerApi.listVolumes();

      if (!rawVolumes || !rawVolumes.Volumes) {
        return;
      }

      // Transform volumes to our format
      const currentVolumes = rawVolumes.Volumes.map((volume) => ({
        name: volume.Name,
        uuid: uuidv4(),
        watcher: this.name,
        deviceUuid: this.configuration.deviceUuid,
        mountPoint: volume.Mountpoint,
        scope: volume.Scope,
        driver: volume.Driver,
        options: volume.Options,
        labels: volume.Labels,
        usageData: volume.UsageData,
      }));

      // Get existing volumes from our database
      const existingVolumes = await this.containerVolumesService.getVolumesByDeviceUuid(
        this.configuration.deviceUuid,
      );

      // Process volumes (insert new ones, update existing)
      await this.processVolumes(currentVolumes, existingVolumes);

      // Delete volumes that no longer exist
      await this.removeDeletedVolumes(currentVolumes, existingVolumes);
    } catch (error: any) {
      this.childLogger.error(`Error watching volumes: ${error.message}`);
    }
  }

  /**
   * Process volumes - create new ones and update existing
   */
  private async processVolumes(currentVolumes: any[], existingVolumes: any[]): Promise<void> {
    for (const volume of currentVolumes) {
      // Check if volume exists in our database
      const existingVolume = existingVolumes.find((v) => v.name === volume.name);

      if (!existingVolume) {
        // New volume, create it
        this.childLogger.info(`Adding new volume ${volume.name}`);
        await this.containerVolumesService.createVolume(this.configuration.deviceUuid, volume);
      } else {
        // Existing volume, update it
        await this.containerVolumesService.updateVolume(existingVolume.uuid, volume);
      }
    }
  }

  /**
   * Remove volumes that no longer exist in Docker
   */
  private async removeDeletedVolumes(currentVolumes: any[], existingVolumes: any[]): Promise<void> {
    // Find volumes that exist in database but not in Docker
    const deletedVolumes = existingVolumes.filter(
      (existingVolume) => !currentVolumes.some((current) => current.name === existingVolume.name),
    );

    // Delete volumes
    for (const volume of deletedVolumes) {
      this.childLogger.info(`Removing deleted volume ${volume.name}`);
      await this.containerVolumesService.deleteVolume(volume.uuid);
    }
  }

  /**
   * Backup a volume
   */
  async backupVolume(
    volumeName: string,
    backupPath: string,
    fileName: string,
    emitEvent: boolean = true,
  ): Promise<string> {
    try {
      const filePath = `${backupPath}/${fileName}`;

      // Ensure backup directory exists
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }

      this.childLogger.info(`Backup of volume "${volumeName}" started...`);

      // Pull Alpine image for the temporary container
      await this.dockerApi.pull('alpine');

      this.childLogger.debug(`backupVolume - Create container`);

      // Create a temporary container that will mount the volume
      const container = await this.dockerApi.createContainer({
        Image: 'alpine',
        Cmd: ['sh', '-c', 'tar -cvf /backup.tar /backup'],
        HostConfig: {
          Binds: [`${volumeName}:/backup:ro`],
        },
        Labels: { 'wud.watch': 'false' },
      });

      this.childLogger.debug(`backupVolume - Start container`);

      // Start the container
      await container.start();

      this.childLogger.debug(`backupVolume - Wait for container`);

      // Wait for the container to finish the tar command
      await container.wait();

      // Copy the tarball from the container
      const tarballStream = await container.getArchive({ path: '/backup.tar' });

      // Write the tarball to the filesystem
      const output = fs.createWriteStream(filePath);
      tarballStream.pipe(output);

      // Track completion and cleanup
      return new Promise((resolve, reject) => {
        output.on('finish', async () => {
          try {
            await container.stop({ t: 0 }).catch(() => {
              this.childLogger.warn(`Container already stopped`);
            });

            await container.remove();

            this.childLogger.info(`Backup of volume ${volumeName} has been saved to ${filePath}`);

            if (emitEvent) {
              this.eventEmitter.emit('volume.backup.success', {
                success: true,
                message: 'Backup success',
                severity: 'info',
                module: 'docker',
              });
            }

            resolve(filePath);
          } catch (error) {
            reject(error);
          }
        });

        output.on('error', async (err) => {
          try {
            this.childLogger.error(`Error while streaming volume contents: ${err.message}`);

            await container.stop({ t: 0 }).catch(() => {
              this.childLogger.warn(`Container already stopped`);
            });

            await container.remove();

            if (emitEvent) {
              this.eventEmitter.emit('volume.backup.error', {
                success: false,
                message: 'Backup error',
                severity: 'error',
                module: 'docker',
              });
            }

            reject(err);
          } catch (cleanupError) {
            reject(cleanupError);
          }
        });
      });
    } catch (error: any) {
      this.childLogger.error(`Error backing up volume: ${error.message}`);

      if (emitEvent) {
        this.eventEmitter.emit('volume.backup.error', {
          success: false,
          message: 'Backup error',
          severity: 'error',
          module: 'docker',
        });
      }

      throw error;
    }
  }
}
