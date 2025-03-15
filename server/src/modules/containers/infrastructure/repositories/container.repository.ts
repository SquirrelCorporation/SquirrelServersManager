import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContainerRepositoryInterface } from '../../domain/repositories/container-repository.interface';
import { ContainerEntity } from '../../domain/entities/container.entity';
import { CONTAINER } from '../schemas/container.schema';
import { ContainerMapper } from '../mappers/container.mapper';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'ContainerRepository' }, { msgPrefix: '[CONTAINER_REPOSITORY] - ' });

@Injectable()
export class ContainerRepository implements ContainerRepositoryInterface {
  constructor(
    @InjectModel(CONTAINER)
    private readonly containerModel: Model<any>,
    private readonly containerMapper: ContainerMapper,
  ) {}

  async findAll(): Promise<ContainerEntity[]> {
    const containers = await this.containerModel.find().exec();
    return containers.map(container => this.containerMapper.toEntity(container));
  }

  async findAllByDeviceUuid(deviceUuid: string): Promise<ContainerEntity[]> {
    const containers = await this.containerModel.find({ deviceUuid }).exec();
    return containers.map(container => this.containerMapper.toEntity(container));
  }

  async findOneByUuid(uuid: string): Promise<ContainerEntity | null> {
    const container = await this.containerModel.findOne({ uuid }).exec();
    return container ? this.containerMapper.toEntity(container) : null;
  }

  async findOneByNameAndDeviceUuid(name: string, deviceUuid: string): Promise<ContainerEntity | null> {
    const container = await this.containerModel.findOne({ name, deviceUuid }).exec();
    return container ? this.containerMapper.toEntity(container) : null;
  }

  async save(container: ContainerEntity): Promise<ContainerEntity> {
    const document = this.containerMapper.toDocument(container);
    
    if (container.id) {
      await this.containerModel.updateOne(
        { _id: new Types.ObjectId(container.id) },
        { $set: document },
      ).exec();
      return container;
    } else {
      const createdContainer = await this.containerModel.create(document);
      return this.containerMapper.toEntity(createdContainer);
    }
  }

  async create(container: ContainerEntity): Promise<ContainerEntity> {
    const document = this.containerMapper.toDocument(container);
    const createdContainer = await this.containerModel.create(document);
    return this.containerMapper.toEntity(createdContainer);
  }

  async update(uuid: string, containerData: Partial<ContainerEntity>): Promise<ContainerEntity> {
    const document = this.containerMapper.toDocument(containerData);
    const updatedContainer = await this.containerModel.findOneAndUpdate(
      { uuid },
      { $set: document },
      { new: true },
    ).exec();
    
    if (!updatedContainer) {
      throw new Error(`Container with UUID ${uuid} not found`);
    }
    
    return this.containerMapper.toEntity(updatedContainer);
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    const result = await this.containerModel.deleteOne({ uuid }).exec();
    return result.deletedCount > 0;
  }

  async deleteAllByDeviceUuid(deviceUuid: string): Promise<boolean> {
    const result = await this.containerModel.deleteMany({ deviceUuid }).exec();
    return result.deletedCount > 0;
  }

  // Legacy methods for backward compatibility
  async findContainerById(id: string): Promise<any> {
    const container = await this.containerModel.findById(id).exec();
    return container;
  }

  async findContainersByDevice(device: any): Promise<any[]> {
    const deviceUuid = device.uuid;
    return this.containerModel.find({ deviceUuid }).exec();
  }

  async findContainersByWatcher(watcher: string): Promise<any[]> {
    return this.containerModel.find({ watchers: watcher }).exec();
  }

  async deleteContainerById(id: string): Promise<any> {
    return this.containerModel.deleteOne({ _id: id }).exec();
  }

  async deleteByDevice(device: any): Promise<any> {
    const deviceUuid = device.uuid;
    return this.containerModel.deleteMany({ deviceUuid }).exec();
  }

  async createContainer(containerDoc: any, device: any): Promise<any> {
    const container = new this.containerModel({
      ...containerDoc,
      deviceUuid: device.uuid,
    });
    return container.save();
  }

  async updateContainer(container: any): Promise<any> {
    return this.containerModel.findByIdAndUpdate(
      container._id,
      { $set: container },
      { new: true },
    ).exec();
  }

  async countByDeviceId(deviceId: string): Promise<number> {
    return this.containerModel.countDocuments({ deviceUuid: deviceId }).exec();
  }

  async countByStatus(status: string): Promise<number> {
    return this.containerModel.countDocuments({ status }).exec();
  }

  async count(): Promise<number> {
    return this.containerModel.countDocuments().exec();
  }

  async updateStatusByWatcher(watcher: string, status: string): Promise<any> {
    return this.containerModel.updateMany(
      { watchers: watcher },
      { $set: { status } },
    ).exec();
  }
}