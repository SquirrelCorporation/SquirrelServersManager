import { ContainerVolumeEntity } from '../../domain/entities/container-volume.entity';

export const CONTAINER_VOLUMES_SERVICE = 'CONTAINER_VOLUMES_SERVICE';

/**
 * Interface for the Container Volumes Service
 */
export interface ContainerVolumesServiceInterface {
  /**
   * Get all container volumes
   */
  getAllVolumes(): Promise<ContainerVolumeEntity[]>;

  /**
   * Get all volumes for a specific device
   */
  getVolumesByDeviceUuid(deviceUuid: string): Promise<ContainerVolumeEntity[]>;

  /**
   * Get a specific volume by UUID
   */
  getVolumeByUuid(uuid: string): Promise<ContainerVolumeEntity | null>;

  /**
   * Create a volume on a device
   */
  createVolume(deviceUuid: string, volume: Partial<ContainerVolumeEntity>): Promise<ContainerVolumeEntity>;

  /**
   * Update a volume
   */
  updateVolume(uuid: string, volume: Partial<ContainerVolumeEntity>): Promise<ContainerVolumeEntity>;

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
  backupVolume(volume: ContainerVolumeEntity, mode: string): Promise<{ filePath: string; fileName: string }>;
}