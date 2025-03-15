import { ContainerImageEntity } from '../entities/container-image.entity';

export const CONTAINER_IMAGE_REPOSITORY = 'CONTAINER_IMAGE_REPOSITORY';

/**
 * Interface for the Container Image Repository
 */
export interface ContainerImageRepositoryInterface {
  /**
   * Find all images
   */
  findAll(): Promise<ContainerImageEntity[]>;

  /**
   * Find all images by device UUID
   */
  findAllByDeviceUuid(deviceUuid: string): Promise<ContainerImageEntity[]>;

  /**
   * Find one image by UUID
   */
  findOneByUuid(uuid: string): Promise<ContainerImageEntity | null>;

  /**
   * Find one image by ID and device UUID
   */
  findOneByIdAndDeviceUuid(id: string, deviceUuid: string): Promise<ContainerImageEntity | null>;

  /**
   * Find images by name and tag
   */
  findByNameAndTag(name: string, tag: string, deviceUuid: string): Promise<ContainerImageEntity[]>;

  /**
   * Create an image
   */
  create(image: ContainerImageEntity): Promise<ContainerImageEntity>;

  /**
   * Update an image
   */
  update(uuid: string, imageData: Partial<ContainerImageEntity>): Promise<ContainerImageEntity>;

  /**
   * Delete an image by UUID
   */
  deleteByUuid(uuid: string): Promise<boolean>;
}