import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { ContainerServiceInterface } from '../../../../../../application/interfaces/container-service.interface';
import { ContainerStatsServiceInterface } from '../../../../../../application/interfaces/container-stats-service.interface';
import { IContainerLogsService } from '../../../../../../application/interfaces/container-logs-service.interface';
import { ContainerImagesServiceInterface } from '../../../../../../application/interfaces/container-images-service.interface';
import { ContainerVolumesServiceInterface } from '../../../../../../application/interfaces/container-volumes-service.interface';
import { ContainerNetworksServiceInterface } from '../../../../../../application/interfaces/container-networks-service.interface';
import { IDockerImagesComponent } from '../../../../../../../../domain/components/docker-watcher.interface';
import { AbstractDockerVolumesComponent } from './abstract-docker-volumes.component';

/**
 * Abstract Docker images component for image management
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerImagesComponent extends AbstractDockerVolumesComponent implements IDockerImagesComponent {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    protected readonly containerService: ContainerServiceInterface,
    protected readonly containerStatsService: ContainerStatsServiceInterface,
    protected readonly containerLogsService: IContainerLogsService,
    protected readonly containerImagesService: ContainerImagesServiceInterface,
    protected readonly containerVolumesService: ContainerVolumesServiceInterface,
    protected readonly containerNetworksService: ContainerNetworksServiceInterface
  ) {
    super(
      eventEmitter,
      containerService,
      containerStatsService,
      containerLogsService,
      containerImagesService,
      containerVolumesService,
      containerNetworksService
    );
  }

  /**
   * Watch images from cron job
   */
  protected async watchImagesFromCron(): Promise<void> {
    this.childLogger.info(
      `watchImagesFromCron - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`
    );

    try {
      // Get current images from Docker
      const rawImages = await this.dockerApi.listImages();

      if (!rawImages) {
        return;
      }

      // Transform images to our format
      const currentImages = rawImages.map(image => ({
        id: image.Id,
        uuid: uuidv4(),
        watcher: this.name,
        deviceUuid: this.configuration.deviceUuid,
        parentId: image.ParentId,
        repoTags: image.RepoTags,
        repoDigests: image.RepoDigests,
        created: image.Created,
        size: image.Size,
        virtualSize: image.VirtualSize,
        sharedSize: image.SharedSize,
        labels: image.Labels
      }));

      // Get existing images from our database
      const existingImages = await this.containerImagesService.getImagesByDeviceUuid(this.configuration.deviceUuid);

      // Insert new images
      await this.insertNewImages(currentImages, existingImages);

      // Delete images that no longer exist
      await this.removeDeletedImages(currentImages, existingImages);

    } catch (error: any) {
      this.childLogger.error(`Error watching images: ${error.message}`);
    }
  }

  /**
   * Insert new images
   */
  private async insertNewImages(currentImages: any[], existingImages: any[]): Promise<void> {
    // Find images that exist in Docker but not in our database
    const newImages = currentImages.filter(
      currentImage => !existingImages.some(existing => existing.id === currentImage.id)
    );

    if (newImages.length > 0) {
      this.childLogger.info(`Inserting ${newImages.length} new images`);

      for (const image of newImages) {
        await this.containerImagesService.createImage(this.configuration.deviceUuid, image);
      }
    }
  }

  /**
   * Remove images that no longer exist in Docker
   */
  private async removeDeletedImages(currentImages: any[], existingImages: any[]): Promise<void> {
    // Find images that exist in our database but not in Docker
    const deletedImages = existingImages.filter(
      existingImage => !currentImages.some(current => current.id === existingImage.id)
    );

    for (const image of deletedImages) {
      this.childLogger.info(`Removing deleted image ${image.id}`);
      await this.containerImagesService.removeImage(image.uuid);
    }
  }
}