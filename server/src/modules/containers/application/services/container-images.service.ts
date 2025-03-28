import { Inject, Injectable } from '@nestjs/common';
import { IContainerImagesService } from '../interfaces/container-images-service.interface';
import { IContainerImageEntity } from '../../domain/entities/container-image.entity';
import { CONTAINER_IMAGE_REPOSITORY } from '../../domain/repositories/container-image-repository.interface';
import { IContainerImageRepository } from '../../domain/repositories/container-image-repository.interface';
import {
  IWatcherEngineService,
  WATCHER_ENGINE_SERVICE,
} from '../interfaces/watcher-engine-service.interface';
import { DevicesService } from '../../../devices/application/services/devices.service';

@Injectable()
export class ContainerImagesService implements IContainerImagesService {
  constructor(
    @Inject(CONTAINER_IMAGE_REPOSITORY)
    private readonly imageRepository: IContainerImageRepository,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: IWatcherEngineService,
    private readonly devicesService: DevicesService,
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
