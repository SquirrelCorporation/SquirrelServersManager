import { ContainerVolumeEntity } from '../entities/container-volume.entity';

export const CONTAINER_VOLUME_REPOSITORY = 'CONTAINER_VOLUME_REPOSITORY';

/**
 * Interface for the Container Volume Repository
 */
export interface ContainerVolumeRepositoryInterface {
  /**
   * Find all volumes
   */
  findAll(): Promise<ContainerVolumeEntity[]>;

  /**
   * Find all volumes by device UUID
   */
  findAllByDeviceUuid(deviceUuid: string): Promise<ContainerVolumeEntity[]>;

  /**
   * Find one volume by UUID
   */
  findOneByUuid(uuid: string): Promise<ContainerVolumeEntity | null>;

  /**
   * Find one volume by name and device UUID
   */
  findOneByNameAndDeviceUuid(name: string, deviceUuid: string): Promise<ContainerVolumeEntity | null>;

  /**
   * Create a volume
   */
  create(volume: ContainerVolumeEntity): Promise<ContainerVolumeEntity>;

  /**
   * Update a volume
   */
  update(uuid: string, volumeData: Partial<ContainerVolumeEntity>): Promise<ContainerVolumeEntity>;

  /**
   * Delete a volume by UUID
   */
  deleteByUuid(uuid: string): Promise<boolean>;
}