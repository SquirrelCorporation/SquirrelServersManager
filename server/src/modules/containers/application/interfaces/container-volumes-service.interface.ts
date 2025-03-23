import { IContainerVolumeEntity } from '../../domain/entities/container-volume.entity';

export const CONTAINER_VOLUMES_SERVICE = 'CONTAINER_VOLUMES_SERVICE';

/**
 * Interface for the Container Volumes Service
 */
export interface IContainerVolumesService {
  /**
   * Get all container volumes
   */
  getAllVolumes(): Promise<IContainerVolumeEntity[]>;

  /**
   * Get all volumes for a specific device
   */
  getVolumesByDeviceUuid(deviceUuid: string): Promise<IContainerVolumeEntity[]>;

  /**
   * Get a specific volume by UUID
   */
  getVolumeByUuid(uuid: string): Promise<IContainerVolumeEntity | null>;

  /**
   * Create a volume on a device
   */
  createVolume(deviceUuid: string, volume: Partial<IContainerVolumeEntity>): Promise<IContainerVolumeEntity>;

  /**
   * Update a volume
   */
  updateVolume(uuid: string, volume: Partial<IContainerVolumeEntity>): Promise<IContainerVolumeEntity>;

  /**
   * Delete a volume
   */
  deleteVolume(uuid: string): Promise<boolean>;

  /**
   * Prune unused volumes
   */
  pruneVolumes(deviceUuid: string): Promise<{ count: number }>;
  
  /**
   * Backup a volume
   * @param volume The volume to backup
   * @param mode The backup mode (filesystem or browser)
   * @returns The file path and name of the backup
   */
  backupVolume(volume: IContainerVolumeEntity, mode: string): Promise<{ filePath: string; fileName: string }>;
}