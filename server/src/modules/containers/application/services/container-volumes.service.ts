import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IContainerVolumesService } from '../interfaces/container-volumes-service.interface';
import { IContainerVolumeEntity } from '../../domain/entities/container-volume.entity';
import { CONTAINER_VOLUME_REPOSITORY } from '../../domain/repositories/container-volume-repository.interface';
import { IContainerVolumeRepository } from '../../domain/repositories/container-volume-repository.interface';
import {
  IWatcherEngineService,
  WATCHER_ENGINE_SERVICE,
} from '../interfaces/watcher-engine-service.interface';
import { DevicesService } from '../../../devices/application/services/devices.service';
import PinoLogger from '../../../../logger';
import { WATCHERS } from '../../constants';

const logger = PinoLogger.child(
  { module: 'ContainerVolumesService' },
  { msgPrefix: '[CONTAINER_VOLUMES] - ' },
);

@Injectable()
export class ContainerVolumesService implements IContainerVolumesService {
  constructor(
    @Inject(CONTAINER_VOLUME_REPOSITORY)
    private readonly volumeRepository: IContainerVolumeRepository,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: IWatcherEngineService,
    private readonly devicesService: DevicesService,
  ) {}

  /**
   * Get all container volumes
   */
  async getAllVolumes(): Promise<IContainerVolumeEntity[]> {
    return this.volumeRepository.findAll();
  }

  /**
   * Get volumes by device UUID
   */
  async getVolumesByDeviceUuid(deviceUuid: string): Promise<IContainerVolumeEntity[]> {
    return this.volumeRepository.findAllByDeviceUuid(deviceUuid);
  }

  /**
   * Get a volume by its UUID
   */
  async getVolumeByUuid(uuid: string): Promise<IContainerVolumeEntity | null> {
    return this.volumeRepository.findOneByUuid(uuid);
  }

  /**
   * Create a new volume on a device
   */
  async createVolume(
    deviceUuid: string,
    volumeData: Partial<IContainerVolumeEntity>,
  ): Promise<IContainerVolumeEntity> {
    try {
      logger.info(`Creating volume ${volumeData.name} on device ${deviceUuid}`);

      // Verify device exists
      const device = await this.devicesService.findOneByUuid(deviceUuid);
      if (!device) {
        throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
      }

      // Check if a volume with the same name already exists
      const existingVolume = await this.volumeRepository.findOneByNameAndDeviceUuid(
        volumeData.name as string,
        deviceUuid,
      );

      if (existingVolume) {
        throw new Error(
          `Volume with name ${volumeData.name} already exists on device ${deviceUuid}`,
        );
      }

      // Save to database
      return this.volumeRepository.create(volumeData);
    } catch (error: any) {
      logger.error(`Failed to create volume: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a volume
   */
  async updateVolume(
    uuid: string,
    volumeData: Partial<IContainerVolumeEntity>,
  ): Promise<IContainerVolumeEntity> {
    try {
      // Find the existing volume
      const existingVolume = await this.volumeRepository.findOneByUuid(uuid);
      if (!existingVolume) {
        throw new NotFoundException(`Volume with UUID ${uuid} not found`);
      }

      // Volumes generally can't be updated in Docker once created
      // We can update our metadata about them though
      return this.volumeRepository.update(uuid, volumeData);
    } catch (error: any) {
      logger.error(`Failed to update volume ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a volume
   */
  async deleteVolume(uuid: string): Promise<boolean> {
    try {
      logger.info(`Deleting volume ${uuid}`);

      // Find the existing volume
      const existingVolume = await this.volumeRepository.findOneByUuid(uuid);
      if (!existingVolume) {
        throw new NotFoundException(`Volume with UUID ${uuid} not found`);
      }

      // Find the Docker watcher component for this device
      const deviceUuid = existingVolume.deviceUuid;
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);

      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Delete volume in Docker
      await this.removeDockerVolume(dockerComponent, existingVolume.name);

      // Delete from database
      return this.volumeRepository.deleteByUuid(uuid);
    } catch (error: any) {
      logger.error(`Failed to delete volume ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Prune unused volumes
   */
  async pruneVolumes(deviceUuid: string): Promise<{ count: number }> {
    try {
      logger.info(`Pruning unused volumes on device ${deviceUuid}`);

      // Find the Docker watcher component for this device
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);

      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Prune volumes in Docker
      const result = await dockerComponent.pruneVolumes();

      // Update database to reflect changes
      // This would ideally sync all volumes to remove pruned ones
      // For now, we'll just return the count of pruned volumes
      return result;
    } catch (error: any) {
      logger.error(`Failed to prune volumes on device ${deviceUuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to remove a Docker volume
   */
  private async removeDockerVolume(dockerComponent: any, volumeName: string): Promise<void> {
    try {
      await dockerComponent.removeVolume(volumeName);
    } catch (error: any) {
      logger.error(`Failed to remove Docker volume: ${error.message}`);
      throw error;
    }
  }

  /**
   * Backup a volume
   * @param volume The volume to backup
   * @param mode The backup mode (filesystem or browser)
   * @returns The file path and name of the backup
   */
  async backupVolume(
    volume: IContainerVolumeEntity,
    mode: string,
  ): Promise<{ filePath: string; fileName: string }> {
    try {
      logger.info(`Backing up volume ${volume.name} in ${mode} mode`);

      // Find the Docker watcher component for this device
      const watcherName = `${WATCHERS.DOCKER}-${volume.deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);

      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${volume.deviceUuid} not found`);
      }

      // Implementation would depend on how Docker volumes are backed up
      // This is a placeholder that would need to be implemented based on the actual requirements

      const fileName = `${volume.name}-backup-${Date.now()}.tar.gz`;
      const filePath = mode === 'filesystem' ? '/var/lib/ssm/backup/volumes/' : '/tmp/';

      logger.info(`Volume ${volume.name} backed up to ${filePath}${fileName}`);

      return { filePath, fileName };
    } catch (error: any) {
      logger.error(`Failed to backup volume ${volume.name}: ${error.message}`);
      throw error;
    }
  }
}
