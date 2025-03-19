import { ContainerImageEntity } from '../../domain/entities/container-image.entity';

export const CONTAINER_IMAGES_SERVICE = 'CONTAINER_IMAGES_SERVICE';

/**
 * Interface for the Container Images Service
 */
export interface ContainerImagesServiceInterface {
  /**
   * Get all container images
   */
  getAllImages(): Promise<ContainerImageEntity[]>;

  /**
   * Get all images for a specific device
   */
  getImagesByDeviceUuid(deviceUuid: string): Promise<ContainerImageEntity[]>;

  /**
   * Get a specific image by UUID
   */
  getImageById(id: string): Promise<ContainerImageEntity | null>;

  /**
   * Create a new image record
   */
  createImage(deviceUuid: string, imageData: Partial<ContainerImageEntity>): Promise<ContainerImageEntity>;

  deleteImageById(id: string);
}