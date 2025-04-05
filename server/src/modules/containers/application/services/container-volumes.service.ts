import { AbstractDockerVolumesComponent } from '@modules/containers/application/services/components/watcher/providers/docker/abstract-docker-volumes.component';
import { Kind } from '@modules/containers/domain/components/kind.enum';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SsmContainer } from 'ssm-shared-lib';
import PinoLogger from '../../../../logger';
import { DevicesService } from '../../../devices/application/services/devices.service';
import { BROWSER_BACKUP_PATH, FILESYSTEM_BACKUP_PATH, WATCHERS } from '../../constants';
import { IContainerVolumeEntity } from '../../domain/entities/container-volume.entity';
import { IContainerVolumesService } from '../../domain/interfaces/container-volumes-service.interface';
import {
  IWatcherEngineService,
  WATCHER_ENGINE_SERVICE,
} from '../../domain/interfaces/watcher-engine-service.interface';
import {
  CONTAINER_VOLUME_REPOSITORY,
  IContainerVolumeRepository,
} from '../../domain/repositories/container-volume-repository.interface';

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
      const dockerComponent = this.watcherEngineService.findRegisteredComponent(
        Kind.WATCHER,
        WATCHERS.DOCKER,
        watcherName,
      );

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
    mode: SsmContainer.VolumeBackupMode,
    asyncResult = false,
  ): Promise<{ filePath: string; fileName: string }> {
    try {
      logger.info(`Backing up volume ${volume.name} in ${mode} mode`);

      // Find the Docker watcher component for this device
      const registeredComponent = this.watcherEngineService.findRegisteredComponent(
        Kind.WATCHER,
        WATCHERS.DOCKER,
        volume.watcher,
      ) as AbstractDockerVolumesComponent;

      if (!registeredComponent) {
        throw new Error(`Docker watcher for device ${volume.deviceUuid} not found`);
      }
      const filePath =
        mode === SsmContainer.VolumeBackupMode.FILE_SYSTEM
          ? FILESYSTEM_BACKUP_PATH
          : BROWSER_BACKUP_PATH;
      const fileName = `${volume.name}_${Date.now()}.tar`;

      if (asyncResult) {
        void registeredComponent.backupVolume(volume.name, filePath, fileName, true);
      } else {
        await registeredComponent.backupVolume(volume.name, filePath, fileName, false);
      }

      logger.info(`Volume ${volume.name} backed up to ${filePath}${fileName}`);

      return { filePath, fileName };
    } catch (error: any) {
      logger.error(`Failed to backup volume ${volume.name}: ${error.message}`);
      throw error;
    }
  }
}
