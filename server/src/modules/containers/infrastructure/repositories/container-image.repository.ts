import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContainerImageRepositoryInterface } from '../../domain/repositories/container-image-repository.interface';
import { ContainerImageEntity } from '../../domain/entities/container-image.entity';
import { ContainerImageMapper } from '../mappers/container-image.mapper';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'ContainerImageRepository' }, { msgPrefix: '[CONTAINER_IMAGE_REPO] - ' });

/**
 * MongoDB implementation of the Container Image Repository
 */
@Injectable()
export class ContainerImageRepository implements ContainerImageRepositoryInterface {
  constructor(
    @InjectModel('ContainerImage')
    private readonly imageModel: Model<any>,
  ) {}

  /**
   * Find all images
   */
  async findAll(): Promise<ContainerImageEntity[]> {
    try {
      const images = await this.imageModel.find().lean().exec();
      return images.map(image => ContainerImageMapper.toEntity(image));
    } catch (error) {
      logger.error(`Failed to find all images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all images by device UUID
   */
  async findAllByDeviceUuid(deviceUuid: string): Promise<ContainerImageEntity[]> {
    try {
      const images = await this.imageModel.find({ deviceUuid }).lean().exec();
      return images.map(image => ContainerImageMapper.toEntity(image));
    } catch (error) {
      logger.error(`Failed to find images for device ${deviceUuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find one image by UUID
   */
  async findOneByUuid(uuid: string): Promise<ContainerImageEntity | null> {
    try {
      const image = await this.imageModel.findOne({ uuid }).lean().exec();
      return image ? ContainerImageMapper.toEntity(image) : null;
    } catch (error) {
      logger.error(`Failed to find image ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find one image by ID and device UUID
   */
  async findOneByIdAndDeviceUuid(id: string, deviceUuid: string): Promise<ContainerImageEntity | null> {
    try {
      const image = await this.imageModel.findOne({ id, deviceUuid }).lean().exec();
      return image ? ContainerImageMapper.toEntity(image) : null;
    } catch (error) {
      logger.error(`Failed to find image ${id} for device ${deviceUuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find images by name and tag
   */
  async findByNameAndTag(name: string, tag: string, deviceUuid: string): Promise<ContainerImageEntity[]> {
    try {
      const images = await this.imageModel.find({ name, tag, deviceUuid }).lean().exec();
      return images.map(image => ContainerImageMapper.toEntity(image));
    } catch (error) {
      logger.error(`Failed to find images ${name}:${tag} for device ${deviceUuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create an image
   */
  async create(image: ContainerImageEntity): Promise<ContainerImageEntity> {
    try {
      const imageDocument = ContainerImageMapper.toDocument(image);
      const createdImage = await this.imageModel.create(imageDocument);
      return ContainerImageMapper.toEntity(createdImage.toObject());
    } catch (error) {
      logger.error(`Failed to create image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an image
   */
  async update(uuid: string, imageData: Partial<ContainerImageEntity>): Promise<ContainerImageEntity> {
    try {
      const updatedImage = await this.imageModel
        .findOneAndUpdate({ uuid }, imageData, { new: true })
        .lean()
        .exec();
      
      if (!updatedImage) {
        throw new Error(`Image with UUID ${uuid} not found`);
      }
      
      return ContainerImageMapper.toEntity(updatedImage);
    } catch (error) {
      logger.error(`Failed to update image ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an image by UUID
   */
  async deleteByUuid(uuid: string): Promise<boolean> {
    try {
      const result = await this.imageModel.deleteOne({ uuid }).exec();
      return result.deletedCount === 1;
    } catch (error) {
      logger.error(`Failed to delete image ${uuid}: ${error.message}`);
      throw error;
    }
  }
}