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
  getImageByUuid(uuid: string): Promise<ContainerImageEntity | null>;

  /**
   * Pull an image on a device
   */
  pullImage(deviceUuid: string, name: string, tag?: string): Promise<ContainerImageEntity>;

  /**
   * Remove an image from a device
   */
  removeImage(uuid: string, force?: boolean): Promise<boolean>;

  /**
   * Build an image from a Dockerfile
   */
  buildImage(deviceUuid: string, dockerfile: string, name: string, tag: string, buildContext: string, buildArgs?: Record<string, string>): Promise<ContainerImageEntity>;

  /**
   * Tag an image with a new name/tag
   */
  tagImage(uuid: string, newName: string, newTag: string): Promise<ContainerImageEntity>;

  /**
   * Push an image to a registry
   */
  pushImage(uuid: string, registryUuid?: string): Promise<boolean>;

  /**
   * Prune unused images
   */
  pruneImages(deviceUuid: string): Promise<{ count: number; spaceReclaimed: number }>;

  /**
   * Get image details
   */
  inspectImage(uuid: string): Promise<any>;
}