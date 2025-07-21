import { IContainerImageEntity } from '../entities/container-image.entity';

export const CONTAINER_IMAGE_REPOSITORY = 'CONTAINER_IMAGE_REPOSITORY';

/**
 * Interface for the Container Image Repository
 */
export interface IContainerImageRepository {
  /**
   * Find all images
   */
  findAll(): Promise<IContainerImageEntity[]>;

  /**
   * Find all images by device UUID
   */
  findAllByDeviceUuid(deviceUuid: string): Promise<IContainerImageEntity[]>;

  /**
   * Find one image by UUID
   */
  findOneById(id: string): Promise<IContainerImageEntity | null>;

  /**
   * Find one image by ID and device UUID
   */
  findOneByIdAndDeviceUuid(id: string, deviceUuid: string): Promise<IContainerImageEntity | null>;

  /**
   * Find images by name and tag
   */
  findByNameAndTag(name: string, tag: string, deviceUuid: string): Promise<IContainerImageEntity[]>;

  /**
   * Create an image
   */
  create(image: IContainerImageEntity): Promise<IContainerImageEntity>;

  /**
   * Update an image
   */
  update(id: string, imageData: Partial<IContainerImageEntity>): Promise<IContainerImageEntity>;

  /**
   * Delete an image by UUID
   */
  deleteById(id: string): Promise<boolean>;
}
