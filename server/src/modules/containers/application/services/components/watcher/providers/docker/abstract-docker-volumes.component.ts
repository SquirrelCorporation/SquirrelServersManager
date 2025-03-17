import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { ContainerServiceInterface } from '../../../../../../application/interfaces/container-service.interface';
import { ContainerStatsServiceInterface } from '../../../../../../application/interfaces/container-stats-service.interface';
import { IContainerLogsService } from '../../../../../../application/interfaces/container-logs-service.interface';
import { ContainerImagesServiceInterface } from '../../../../../../application/interfaces/container-images-service.interface';
import { ContainerVolumesServiceInterface } from '../../../../../../application/interfaces/container-volumes-service.interface';
import { ContainerNetworksServiceInterface } from '../../../../../../application/interfaces/container-networks-service.interface';
import { AbstractDockerNetworksComponent } from './abstract-docker-networks.component';
import { IDockerVolumesComponent } from '../../../../../../../../domain/components/docker-watcher.interface';

/**
 * Abstract Docker volumes component for volume management
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerVolumesComponent extends AbstractDockerNetworksComponent implements IDockerVolumesComponent {
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
   * Watch volumes from cron job
   */
  protected async watchVolumesFromCron(): Promise<void> {
    this.childLogger.info(
      `watchVolumesFromCron - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
    );

    try {
      // Get current volumes from Docker
      const rawVolumes = await this.dockerApi.listVolumes();

      if (!rawVolumes || !rawVolumes.Volumes) {
        return;
      }

      // Transform volumes to our format
      const currentVolumes = rawVolumes.Volumes.map(volume => ({
        name: volume.Name,
        uuid: uuidv4(),
        watcher: this.name,
        deviceUuid: this.configuration.deviceUuid,
        mountPoint: volume.Mountpoint,
        scope: volume.Scope,
        driver: volume.Driver,
        options: volume.Options,
        labels: volume.Labels,
        usageData: volume.UsageData
      }));

      // Get existing volumes from our database
      const existingVolumes = await this.containerVolumesService.getVolumesByDeviceUuid(this.configuration.deviceUuid);

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
      const existingVolume = existingVolumes.find(v => v.name === volume.name);

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
      existingVolume => !currentVolumes.some(current => current.name === existingVolume.name)
    );

    // Delete volumes
    for (const volume of deletedVolumes) {
      this.childLogger.info(`Removing deleted volume ${volume.name}`);
      await this.containerVolumesService.removeVolume(volume.uuid);
    }
  }

  /**
   * Backup a volume
   */
  async backupVolume(volumeName: string, backupPath: string, fileName: string, emitEvent: boolean = true): Promise<string> {
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
          Binds: [`${volumeName}:/backup:ro`]
        },
        Labels: { 'wud.watch': 'false' }
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
                module: 'docker'
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
                module: 'docker'
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
          module: 'docker'
        });
      }

      throw error;
    }
  }
}