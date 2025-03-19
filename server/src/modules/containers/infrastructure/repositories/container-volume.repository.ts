import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContainerVolumeRepositoryInterface } from '../../domain/repositories/container-volume-repository.interface';
import { ContainerVolumeEntity } from '../../domain/entities/container-volume.entity';
import { ContainerVolumeMapper } from '../mappers/container-volume.mapper';
import { CONTAINER_VOLUME } from '../schemas/container-volume.schema';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'ContainerVolumeRepository' }, { msgPrefix: '[CONTAINER_VOLUME_REPO] - ' });

/**
 * MongoDB implementation of the Container Volume Repository
 */
@Injectable()
export class ContainerVolumeRepository implements ContainerVolumeRepositoryInterface {
  constructor(
    @InjectModel(CONTAINER_VOLUME)
    private readonly volumeModel: Model<any>,
  ) {}

  /**
   * Find all volumes
   */
  async findAll(): Promise<ContainerVolumeEntity[]> {
    try {
      const volumes = await this.volumeModel.find().populate('device').lean().exec();
      return volumes.map(volume => ContainerVolumeMapper.toEntity(volume));
    } catch (error: any) {
      logger.error(`Failed to find all volumes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all volumes by device UUID
   */
  async findAllByDeviceUuid(deviceUuid: string): Promise<ContainerVolumeEntity[]> {
    try {
      const volumes = await this.volumeModel.find({ deviceUuid }).populate('device').lean().exec();
      return volumes.map(volume => ContainerVolumeMapper.toEntity(volume));
    } catch (error: any) {
      logger.error(`Failed to find volumes for device ${deviceUuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find one volume by UUID
   */
  async findOneByUuid(uuid: string): Promise<ContainerVolumeEntity | null> {
    try {
      const volume = await this.volumeModel.findOne({ uuid }).populate('device').lean().exec();
      return volume ? ContainerVolumeMapper.toEntity(volume) : null;
    } catch (error: any) {
      logger.error(`Failed to find volume ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find one volume by name and device UUID
   */
  async findOneByNameAndDeviceUuid(name: string, deviceUuid: string): Promise<ContainerVolumeEntity | null> {
    try {
      const volume = await this.volumeModel.findOne({ name, deviceUuid }).populate('device').lean().exec();
      return volume ? ContainerVolumeMapper.toEntity(volume) : null;
    } catch (error: any) {
      logger.error(`Failed to find volume ${name} for device ${deviceUuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a volume
   */
  async create(volume: ContainerVolumeEntity): Promise<ContainerVolumeEntity> {
    try {
      const volumeDocument = ContainerVolumeMapper.toDocument(volume);
      const createdVolume = await this.volumeModel.create(volumeDocument);
      return ContainerVolumeMapper.toEntity(createdVolume.toObject());
    } catch (error: any) {
      logger.error(`Failed to create volume: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a volume
   */
  async update(uuid: string, volumeData: Partial<ContainerVolumeEntity>): Promise<ContainerVolumeEntity> {
    try {
      const updatedVolume = await this.volumeModel
        .findOneAndUpdate({ uuid }, volumeData, { new: true })
        .lean()
        .exec();

      if (!updatedVolume) {
        throw new Error(`Volume with UUID ${uuid} not found`);
      }

      return ContainerVolumeMapper.toEntity(updatedVolume);
    } catch (error: any) {
      logger.error(`Failed to update volume ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a volume by UUID
   */
  async deleteByUuid(uuid: string): Promise<boolean> {
    try {
      const result = await this.volumeModel.deleteOne({ uuid }).exec();
      return result.deletedCount === 1;
    } catch (error: any) {
      logger.error(`Failed to delete volume ${uuid}: ${error.message}`);
      throw error;
    }
  }
}