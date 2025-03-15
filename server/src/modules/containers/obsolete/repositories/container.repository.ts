import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SsmContainer } from 'ssm-shared-lib';
import { CONTAINER, ContainerDocument } from '../schemas/container.schema';
import { addLinkProperty, getKindProperty, isUpdateAvailable } from '../utils/utils';

@Injectable()
export class ContainerRepository {
  constructor(
    @InjectModel(CONTAINER)
    private readonly containerModel: Model<ContainerDocument>,
  ) {}

  async findAll() {
    return this.containerModel.aggregate([
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      { $unwind: '$device' },
      {
        $addFields: {
          displayType: SsmContainer.ContainerTypes.DOCKER,
        },
      },
    ]).exec();
  }

  async findContainerById(id: string) {
    return this.containerModel.findOne({ id }).lean().exec();
  }

  async findContainersByDevice(device: any) {
    return this.containerModel.find({ device }).lean().exec();
  }

  async findContainersByWatcher(watcher: string) {
    return this.containerModel.find({ watcher }).lean().exec();
  }

  async deleteContainerById(id: string) {
    return this.containerModel.deleteOne({ id }).exec();
  }

  async deleteByDevice(device: any) {
    return this.containerModel.deleteMany({ device }).exec();
  }

  async createContainer(container: ContainerDocument, device: any) {
    container.link = addLinkProperty(container);
    container.updateKind = getKindProperty(container);
    container.updateAvailable = isUpdateAvailable(container);
    container.device = device;
    const createdContainer = await this.containerModel.create(container);
    return createdContainer.toObject();
  }

  async updateContainer(container: ContainerDocument) {
    container.link = addLinkProperty(container);
    container.updateKind = getKindProperty(container);
    container.updateAvailable = isUpdateAvailable(container);
    await this.containerModel.updateOne({ id: container.id }, container);
    return container;
  }

  async countByDeviceId(deviceId: string) {
    return this.containerModel.countDocuments({ device: new Types.ObjectId(deviceId) }).exec();
  }

  async countByStatus(status: string) {
    return this.containerModel.countDocuments({ status }).exec();
  }

  async count() {
    return this.containerModel.countDocuments().exec();
  }

  async updateStatusByWatcher(watcher: string, status: string) {
    return this.containerModel.updateMany({ watcher }, { status }).exec();
  }
}
