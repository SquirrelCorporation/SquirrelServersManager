import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ContainerImagesServiceInterface } from '../interfaces/container-images-service.interface';
import { ContainerImageEntity } from '../../domain/entities/container-image.entity';
import { CONTAINER_IMAGE_REPOSITORY } from '../../domain/repositories/container-image-repository.interface';
import { ContainerImageRepositoryInterface } from '../../domain/repositories/container-image-repository.interface';
import { WATCHER_ENGINE_SERVICE } from '../interfaces/watcher-engine-service.interface';
import { WatcherEngineServiceInterface } from '../interfaces/watcher-engine-service.interface';
import { DevicesService } from '../../../devices/application/services/devices.service';
import { ContainerImageMapper } from '../../infrastructure/mappers/container-image.mapper';
import PinoLogger from '../../../../logger';
import { WATCHERS } from '../../constants';

const logger = PinoLogger.child({ module: 'ContainerImagesService' }, { msgPrefix: '[CONTAINER_IMAGES] - ' });

@Injectable()
export class ContainerImagesService implements ContainerImagesServiceInterface {
  constructor(
    @Inject(CONTAINER_IMAGE_REPOSITORY)
    private readonly imageRepository: ContainerImageRepositoryInterface,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: WatcherEngineServiceInterface,
    private readonly devicesService: DevicesService,
  ) {}

  /**
   * Get all container images
   */
  async getAllImages(): Promise<ContainerImageEntity[]> {
    return this.imageRepository.findAll();
  }

  /**
   * Get images by device UUID
   */
  async getImagesByDeviceUuid(deviceUuid: string): Promise<ContainerImageEntity[]> {
    return this.imageRepository.findAllByDeviceUuid(deviceUuid);
  }

  /**
   * Get an image by its UUID
   */
  async getImageByUuid(uuid: string): Promise<ContainerImageEntity | null> {
    return this.imageRepository.findOneByUuid(uuid);
  }


  /**
   * Create a new image record
   */
  async createImage(deviceUuid: string, imageData: Partial<ContainerImageEntity>): Promise<ContainerImageEntity> {
    return this.imageRepository.create(imageData);
  }

  /**
   * Delete an image by its ID
   */
  async deleteImageById(id: string): Promise<boolean> {
    return this.imageRepository.deleteById(id);
  }
}