import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ContainerImagesServiceInterface } from '../interfaces/container-images-service.interface';
import { ContainerImageEntity } from '../../domain/entities/container-image.entity';
import { CONTAINER_IMAGE_REPOSITORY } from '../../domain/repositories/container-image-repository.interface';
import { ContainerImageRepositoryInterface } from '../../domain/repositories/container-image-repository.interface';
import { WATCHER_ENGINE_SERVICE } from '../interfaces/watcher-engine-service.interface';
import { WatcherEngineServiceInterface } from '../interfaces/watcher-engine-service.interface';
import { DevicesService } from '../../../devices/application/services/devices.service';
import { ContainerImageMapper } from '../../infrastructure/mappers/container-image.mapper';
import PinoLogger from '../../../../logger';
import { v4 as uuidv4 } from 'uuid';
import { WATCHERS } from '../../constants';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
   * Get image details
   */
  async inspectImage(uuid: string): Promise<any> {
    try {
      // Find the existing image
      const existingImage = await this.imageRepository.findOneByUuid(uuid);
      if (!existingImage) {
        throw new NotFoundException(`Image with UUID ${uuid} not found`);
      }

      // Find the Docker watcher component for this device
      const deviceUuid = existingImage.deviceUuid;
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Get image details from Docker
      return dockerComponent.getImage(existingImage.id);
    } catch (error) {
      logger.error(`Failed to inspect image ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Pull an image on a device
   */
  async pullImage(deviceUuid: string, name: string, tag: string = 'latest'): Promise<ContainerImageEntity> {
    try {
      logger.info(`Pulling image ${name}:${tag} on device ${deviceUuid}`);
      
      // Verify device exists
      const device = await this.devicesService.findByUuid(deviceUuid);
      if (!device) {
        throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
      }

      // Find the Docker watcher component for this device
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Pull the image
      const dockerImage = await dockerComponent.pullImage(name, tag);
      
      // Check if the image already exists in the database
      const existingImages = await this.imageRepository.findByNameAndTag(name, tag, deviceUuid);
      
      if (existingImages.length > 0) {
        // Update the existing image
        const existingImage = existingImages[0];
        const updatedImage = {
          ...dockerImage,
          uuid: existingImage.uuid,
        };
        
        return this.imageRepository.update(existingImage.uuid, updatedImage);
      }
      
      // Create a new image entity
      const imageEntity: ContainerImageEntity = {
        id: dockerImage.id,
        uuid: uuidv4(),
        name: dockerImage.name,
        tag: dockerImage.tag,
        deviceUuid,
        size: dockerImage.size || 0,
        createdAt: dockerImage.createdAt || new Date(),
        parentId: dockerImage.parentId,
        repoDigests: dockerImage.repoDigests,
        labels: dockerImage.labels || {},
        containers: [],
        virtualSize: dockerImage.virtualSize,
      };

      // Save to database
      return this.imageRepository.create(imageEntity);
    } catch (error) {
      logger.error(`Failed to pull image ${name}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove an image from a device
   */
  async removeImage(uuid: string, force: boolean = false): Promise<boolean> {
    try {
      logger.info(`Removing image ${uuid}`);
      
      // Find the existing image
      const existingImage = await this.imageRepository.findOneByUuid(uuid);
      if (!existingImage) {
        throw new NotFoundException(`Image with UUID ${uuid} not found`);
      }

      // Find the Docker watcher component for this device
      const deviceUuid = existingImage.deviceUuid;
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Remove the image from Docker
      await dockerComponent.removeImage(existingImage.id, force);

      // Remove from database
      return this.imageRepository.deleteByUuid(uuid);
    } catch (error) {
      logger.error(`Failed to remove image ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build an image from a Dockerfile
   */
  async buildImage(
    deviceUuid: string, 
    dockerfile: string, 
    name: string, 
    tag: string, 
    buildContext: string,
    buildArgs?: Record<string, string>
  ): Promise<ContainerImageEntity> {
    try {
      logger.info(`Building image ${name}:${tag} on device ${deviceUuid}`);
      
      // Verify device exists
      const device = await this.devicesService.findByUuid(deviceUuid);
      if (!device) {
        throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
      }

      // Find the Docker watcher component for this device
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Ensure build context exists
      if (!fs.existsSync(buildContext)) {
        throw new Error(`Build context directory ${buildContext} does not exist`);
      }

      // Create a Dockerfile in the build context
      const dockerfilePath = path.join(buildContext, 'Dockerfile');
      fs.writeFileSync(dockerfilePath, dockerfile);

      // Build the image
      const buildOptions = {
        t: `${name}:${tag}`,
        buildargs: buildArgs,
      };
      
      const dockerImage = await dockerComponent.buildImage(buildContext, buildOptions);
      
      // Create a new image entity
      const imageEntity: ContainerImageEntity = {
        id: dockerImage.id,
        uuid: uuidv4(),
        name,
        tag,
        deviceUuid,
        size: dockerImage.size || 0,
        createdAt: dockerImage.createdAt || new Date(),
        parentId: dockerImage.parentId,
        repoDigests: dockerImage.repoDigests,
        labels: dockerImage.labels || {},
        containers: [],
        virtualSize: dockerImage.virtualSize,
      };

      // Save to database
      return this.imageRepository.create(imageEntity);
    } catch (error) {
      logger.error(`Failed to build image ${name}:${tag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tag an image with a new name/tag
   */
  async tagImage(uuid: string, newName: string, newTag: string): Promise<ContainerImageEntity> {
    try {
      logger.info(`Tagging image ${uuid} as ${newName}:${newTag}`);
      
      // Find the existing image
      const existingImage = await this.imageRepository.findOneByUuid(uuid);
      if (!existingImage) {
        throw new NotFoundException(`Image with UUID ${uuid} not found`);
      }

      // Find the Docker watcher component for this device
      const deviceUuid = existingImage.deviceUuid;
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Tag the image
      await dockerComponent.tagImage(existingImage.id, newName, newTag);
      
      // Get the new image details
      const images = await dockerComponent.listImages({
        filters: { reference: [`${newName}:${newTag}`] },
      });
      
      if (images.length === 0) {
        throw new Error(`Failed to find tagged image ${newName}:${newTag}`);
      }
      
      const taggedImage = images[0];
      
      // Create a new image entity for the tagged image
      const imageEntity: ContainerImageEntity = {
        id: taggedImage.id,
        uuid: uuidv4(),
        name: newName,
        tag: newTag,
        deviceUuid,
        size: taggedImage.size || 0,
        createdAt: taggedImage.createdAt || new Date(),
        parentId: taggedImage.parentId,
        repoDigests: taggedImage.repoDigests,
        labels: taggedImage.labels || {},
        containers: [],
        virtualSize: taggedImage.virtualSize,
      };

      // Save to database
      return this.imageRepository.create(imageEntity);
    } catch (error) {
      logger.error(`Failed to tag image ${uuid} as ${newName}:${newTag}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Push an image to a registry
   */
  async pushImage(uuid: string, registryUuid?: string): Promise<boolean> {
    try {
      logger.info(`Pushing image ${uuid}`);
      
      // Find the existing image
      const existingImage = await this.imageRepository.findOneByUuid(uuid);
      if (!existingImage) {
        throw new NotFoundException(`Image with UUID ${uuid} not found`);
      }

      // Find the Docker watcher component for this device
      const deviceUuid = existingImage.deviceUuid;
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // TODO: If registryUuid is provided, get registry credentials
      const authConfig = registryUuid ? undefined : undefined;

      // Push the image
      await dockerComponent.pushImage(existingImage.name, existingImage.tag, authConfig);
      
      return true;
    } catch (error) {
      logger.error(`Failed to push image ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Prune unused images
   */
  async pruneImages(deviceUuid: string): Promise<{ count: number; spaceReclaimed: number }> {
    try {
      logger.info(`Pruning unused images on device ${deviceUuid}`);
      
      // Verify device exists
      const device = await this.devicesService.findByUuid(deviceUuid);
      if (!device) {
        throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
      }

      // Find the Docker watcher component for this device
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Prune images
      const result = await dockerComponent.pruneImages();
      
      // Remove pruned images from database
      // This would require additional work to identify which images were pruned
      // For now, we'll just return the result

      return result;
    } catch (error) {
      logger.error(`Failed to prune images on device ${deviceUuid}: ${error.message}`);
      throw error;
    }
  }
}