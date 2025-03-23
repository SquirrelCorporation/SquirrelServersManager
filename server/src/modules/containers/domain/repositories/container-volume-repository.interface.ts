import { IContainerVolumeEntity } from '../entities/container-volume.entity';

export const CONTAINER_VOLUME_REPOSITORY = 'CONTAINER_VOLUME_REPOSITORY';

/**
 * Interface for the Container Volume Repository
 */
export interface IContainerVolumeRepository {
  /**
   * Find all volumes
   */
  findAll(): Promise<IContainerVolumeEntity[]>;

  /**
   * Find all volumes by device UUID
   */
  findAllByDeviceUuid(deviceUuid: string): Promise<IContainerVolumeEntity[]>;

  /**
   * Find one volume by UUID
   */
  findOneByUuid(uuid: string): Promise<IContainerVolumeEntity | null>;

  /**
   * Find one volume by name and device UUID
   */
  findOneByNameAndDeviceUuid(name: string, deviceUuid: string): Promise<IContainerVolumeEntity | null>;

  /**
   * Create a volume
   */
  create(volume: IContainerVolumeEntity): Promise<IContainerVolumeEntity>;

  /**
   * Update a volume
   */
  update(uuid: string, volumeData: Partial<IContainerVolumeEntity>): Promise<IContainerVolumeEntity>;

  /**
   * Delete a volume by UUID
   */
  deleteByUuid(uuid: string): Promise<boolean>;
}