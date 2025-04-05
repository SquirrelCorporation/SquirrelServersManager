import { Inject, Injectable } from '@nestjs/common';
import { IContainerImageEntity } from '../../domain/entities/container-image.entity';
import { IContainerImagesService } from '../../domain/interfaces/container-images-service.interface';
import {
  CONTAINER_IMAGE_REPOSITORY,
  IContainerImageRepository,
} from '../../domain/repositories/container-image-repository.interface';

@Injectable()
export class ContainerImagesService implements IContainerImagesService {
  constructor(
    @Inject(CONTAINER_IMAGE_REPOSITORY)
    private readonly imageRepository: IContainerImageRepository,
  ) {}

  /**
   * Get all container images
   */
  async getAllImages(): Promise<IContainerImageEntity[]> {
    return this.imageRepository.findAll();
  }

  /**
   * Get images by device UUID
   */
  async getImagesByDeviceUuid(deviceUuid: string): Promise<IContainerImageEntity[]> {
    return this.imageRepository.findAllByDeviceUuid(deviceUuid);
  }

  /**
   * Get an image by its UUID
   */
  async getImageById(uuid: string): Promise<IContainerImageEntity | null> {
    return this.imageRepository.findOneById(uuid);
  }

  /**
   * Create a new image record
   */
  async createImage(
    deviceUuid: string,
    imageData: Partial<IContainerImageEntity>,
  ): Promise<IContainerImageEntity> {
    const completeImageData = {
      ...imageData,
      deviceUuid,
      labels: imageData.labels || {},
      created: imageData.created || Date.now(),
      size: imageData.size || 0,
      virtualSize: imageData.virtualSize || 0,
      sharedSize: imageData.sharedSize || 0,
    } as IContainerImageEntity;

    return this.imageRepository.create(completeImageData);
  }

  /**
   * Delete an image by its ID
   */
  async deleteImageById(id: string): Promise<boolean> {
    return this.imageRepository.deleteById(id);
  }
}
