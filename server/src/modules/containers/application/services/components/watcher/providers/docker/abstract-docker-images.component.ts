import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IContainerImageEntity } from '@modules/containers/domain/entities/container-image.entity';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '../../../../../../application/interfaces/container-service.interface';
import {
  CONTAINER_STATS_SERVICE,
  IContainerStatsService,
} from '../../../../../../application/interfaces/container-stats-service.interface';
import {
  CONTAINER_LOGS_SERVICE,
  IContainerLogsService,
} from '../../../../../../application/interfaces/container-logs-service.interface';
import {
  CONTAINER_IMAGES_SERVICE,
  IContainerImagesService,
} from '../../../../../../application/interfaces/container-images-service.interface';
import {
  CONTAINER_VOLUMES_SERVICE,
  IContainerVolumesService,
} from '../../../../../../application/interfaces/container-volumes-service.interface';
import {
  CONTAINER_NETWORKS_SERVICE,
  IContainerNetworksService,
} from '../../../../../../application/interfaces/container-networks-service.interface';
import { AbstractDockerVolumesComponent } from './abstract-docker-volumes.component';

/**
 * Abstract Docker images component for image management
 * Following the playbooks module pattern, all dependencies are injected through constructor
 */
@Injectable()
export abstract class AbstractDockerImagesComponent extends AbstractDockerVolumesComponent {
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    @Inject(CONTAINER_SERVICE)
    protected readonly containerService: IContainerService,
    @Inject(CONTAINER_STATS_SERVICE)
    protected readonly containerStatsService: IContainerStatsService,
    @Inject(CONTAINER_LOGS_SERVICE)
    protected readonly containerLogsService: IContainerLogsService,
    @Inject(CONTAINER_IMAGES_SERVICE)
    protected readonly containerImagesService: IContainerImagesService,
    @Inject(CONTAINER_VOLUMES_SERVICE)
    protected readonly containerVolumesService: IContainerVolumesService,
    @Inject(CONTAINER_NETWORKS_SERVICE)
    protected readonly containerNetworksService: IContainerNetworksService,
  ) {
    super(
      eventEmitter,
      containerService,
      containerStatsService,
      containerLogsService,
      containerImagesService,
      containerVolumesService,
      containerNetworksService,
    );
  }

  /**
   * Watch images from cron job
   */
  protected async watchImagesFromCron(): Promise<void> {
    this.childLogger.info(
      `watchImagesFromCron - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );

    try {
      // Get current images from Docker
      const rawImages = await this.dockerApi.listImages();

      if (!rawImages) {
        return;
      }

      // Transform images to our format
      const currentImages = rawImages.map((image) => ({
        id: image.Id,
        watcher: this.name,
        deviceUuid: this.configuration.deviceUuid,
        parentId: image.ParentId,
        repoTags: image.RepoTags,
        repoDigests: image.RepoDigests,
        created: image.Created,
        size: image.Size,
        virtualSize: image.VirtualSize,
        sharedSize: image.SharedSize,
        labels: image.Labels,
      }));

      // Get existing images from our database
      const existingImages = await this.containerImagesService.getImagesByDeviceUuid(
        this.configuration.deviceUuid,
      );

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
  private async insertNewImages(
    currentImages: IContainerImageEntity[],
    existingImages: IContainerImageEntity[],
  ): Promise<void> {
    // Find images that exist in Docker but not in our database
    const newImages = currentImages.filter(
      (currentImage) => !existingImages.some((existing) => existing.id === currentImage.id),
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
  private async removeDeletedImages(
    currentImages: IContainerImageEntity[],
    existingImages: IContainerImageEntity[],
  ): Promise<void> {
    // Find images that exist in our database but not in Docker
    const deletedImages = existingImages.filter(
      (existingImage) => !currentImages.some((current) => current.id === existingImage.id),
    );

    for (const image of deletedImages) {
      this.childLogger.info(`Removing deleted image ${image.id}`);
      await this.containerImagesService.deleteImageById(image.id);
    }
  }
}
