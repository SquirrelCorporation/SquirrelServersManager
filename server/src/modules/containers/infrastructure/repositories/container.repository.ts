import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SsmContainer } from 'ssm-shared-lib';
import { IContainerRepository } from '../../domain/repositories/container-repository.interface';
import { IContainerEntity } from '../../domain/entities/container.entity';
import { CONTAINER_SCHEMA, Container } from '../schemas/container.schema';
import { ContainerMapper } from '../mappers/container.mapper';

@Injectable()
export class ContainerRepository implements IContainerRepository {
  private readonly logger = new Logger(ContainerRepository.name);
  constructor(
    @InjectModel(CONTAINER_SCHEMA)
    private readonly containerModel: Model<Container>,
    private readonly containerMapper: ContainerMapper,
  ) {}

  async findAll(): Promise<IContainerEntity[]> {
    const containers = await this.containerModel
      .aggregate([
        {
          $addFields: {
            displayType: SsmContainer.ContainerTypes.DOCKER,
          },
        },
        {
          $lookup: {
            from: 'devices',
            localField: 'deviceUuid',
            foreignField: 'uuid',
            as: 'device',
          },
        },
        {
          $unwind: {
            path: '$device',
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .exec();
    return containers.map((container) => this.containerMapper.toEntity(container));
  }

  async findAllByDeviceUuid(deviceUuid: string): Promise<IContainerEntity[]> {
    const containers = await this.containerModel
      .find({ deviceUuid })
      .populate('device')
      .lean()
      .exec();
    return containers.map((container) => this.containerMapper.toEntity(container));
  }

  async findOneById(id: string): Promise<IContainerEntity | null> {
    const container = await this.containerModel.findOne({ id }).populate('device').lean().exec();
    return container ? this.containerMapper.toEntity(container) : null;
  }

  async findOneByNameAndDeviceUuid(
    name: string,
    deviceUuid: string,
  ): Promise<IContainerEntity | null> {
    const container = await this.containerModel
      .findOne({ name, deviceUuid })
      .populate('device')
      .lean()
      .exec();
    return container ? this.containerMapper.toEntity(container) : null;
  }

  async save(container: IContainerEntity): Promise<IContainerEntity> {
    const document = this.containerMapper.toDocument(container);

    if (container.id) {
      await this.containerModel
        .updateOne({ _id: new Types.ObjectId(container.id) }, { $set: document })
        .exec();
      return container;
    } else {
      const createdContainer = await this.containerModel.create(document);
      return this.containerMapper.toEntity(createdContainer);
    }
  }

  async create(container: Partial<IContainerEntity>): Promise<IContainerEntity> {
    const document = this.containerMapper.toDocument(container);
    const createdContainer = await this.containerModel.create(document);
    return this.containerMapper.toEntity(createdContainer);
  }

  async update(id: string, containerData: Partial<IContainerEntity>): Promise<IContainerEntity> {
    const document = this.containerMapper.toDocument(containerData as IContainerEntity);
    const updatedContainer = await this.containerModel
      .findOneAndUpdate({ id }, { $set: document }, { new: true })
      .exec();

    if (!updatedContainer) {
      throw new Error(`Container with ID ${id} not found`);
    }

    return this.containerMapper.toEntity(updatedContainer);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.containerModel.deleteOne({ id }).exec();
    return result.deletedCount > 0;
  }

  async deleteAllByDeviceUuid(deviceUuid: string): Promise<boolean> {
    const result = await this.containerModel.deleteMany({ deviceUuid }).exec();
    return result.deletedCount > 0;
  }

  // Legacy methods for backward compatibility
  async findContainerById(id: string): Promise<any> {
    const container = await this.containerModel.findById(id).lean().exec();
    return container;
  }

  async findContainersByDevice(device: any): Promise<any[]> {
    const deviceUuid = device.uuid;
    return this.containerModel.find({ deviceUuid }).populate('device').lean().exec();
  }

  async findAllByWatcher(watcher: string): Promise<IContainerEntity[]> {
    const containers = await this.containerModel
      .find({ watcher: watcher })
      .populate('device')
      .lean()
      .exec();
    return containers.map((container) => this.containerMapper.toEntity(container));
  }

  async deleteContainerById(id: string): Promise<any> {
    return this.containerModel.deleteOne({ _id: id }).lean().exec();
  }

  async deleteByDevice(device: any): Promise<any> {
    const deviceUuid = device.uuid;
    return this.containerModel.deleteMany({ deviceUuid }).lean().exec();
  }

  async createContainer(containerDoc: any, device: any): Promise<any> {
    const container = new this.containerModel({
      ...containerDoc,
      deviceUuid: device.uuid,
    });
    return container.save();
  }

  async updateContainer(container: any): Promise<any> {
    return this.containerModel
      .findByIdAndUpdate(container._id, { $set: container }, { new: true })
      .lean()
      .exec();
  }

  async countByDeviceUuid(deviceUuid: string): Promise<number> {
    return this.containerModel.countDocuments({ deviceUuid: deviceUuid }).lean().exec();
  }

  async countByStatus(status: string): Promise<number> {
    return this.containerModel.countDocuments({ status }).lean().exec();
  }

  async count(): Promise<number> {
    return this.containerModel.countDocuments().lean().exec();
  }

  async updateStatusByWatcher(watcher: string, status: string): Promise<any> {
    return this.containerModel
      .updateMany({ watchers: watcher }, { $set: { status } })
      .lean()
      .exec();
  }
}
