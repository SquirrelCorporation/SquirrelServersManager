import { IContainerImageEntity } from '../../domain/entities/container-image.entity';

export const CONTAINER_IMAGES_SERVICE = 'CONTAINER_IMAGES_SERVICE';

/**
 * Interface for the Container Images Service
 */
export interface IContainerImagesService {
  /**
   * Get all container images
   */
  getAllImages(): Promise<IContainerImageEntity[]>;

  /**
   * Get all images for a specific device
   */
  getImagesByDeviceUuid(deviceUuid: string): Promise<IContainerImageEntity[]>;

  /**
   * Get a specific image by UUID
   */
  getImageById(id: string): Promise<IContainerImageEntity | null>;

  /**
   * Create a new image record
   */
  createImage(
    deviceUuid: string,
    imageData: Partial<IContainerImageEntity>,
  ): Promise<IContainerImageEntity>;

  deleteImageById(id: string);
}
