import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SsmContainer } from 'ssm-shared-lib';
import {
  PROXMOX_CONTAINER,
  ProxmoxContainerDocument,
} from '../schemas/proxmox-container.schema';

@Injectable()
export class ProxmoxContainerRepository {
  constructor(
    @InjectModel(PROXMOX_CONTAINER)
    private readonly proxmoxContainerModel: Model<ProxmoxContainerDocument>,
  ) {}

  async findAll() {
    return this.proxmoxContainerModel.aggregate([
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
          displayType: SsmContainer.ContainerTypes.PROXMOX,
        },
      },
    ]).exec();
  }

  async updateOrCreate(container: Partial<ProxmoxContainerDocument>) {
    return this.proxmoxContainerModel.findOneAndUpdate(
      { name: container.name, watcher: container.watcher },
      container,
      { upsert: true, new: true },
    );
  }

  async findContainerByUuid(uuid: string) {
    return this.proxmoxContainerModel.findOne({ uuid }).lean().exec();
  }

  async findContainersByDevice(device: any) {
    return this.proxmoxContainerModel.find({ device }).lean().exec();
  }

  async findContainersByWatcher(watcher: string) {
    return this.proxmoxContainerModel.find({ watcher }).lean().exec();
  }

  async deleteContainerByUuid(uuid: string) {
    return this.proxmoxContainerModel.deleteOne({ uuid }).exec();
  }

  async deleteByDevice(device: any) {
    return this.proxmoxContainerModel.deleteMany({ device }).exec();
  }

  async createContainer(container: ProxmoxContainerDocument, device: any) {
    container.device = device;
    const createdContainer = await this.proxmoxContainerModel.create(container);
    return createdContainer.toObject();
  }

  async updateContainer(container: ProxmoxContainerDocument) {
    await this.proxmoxContainerModel.updateOne({ uuid: container.uuid }, container);
    return container;
  }

  async countByDeviceId(deviceId: string) {
    return this.proxmoxContainerModel.countDocuments({ device: new Types.ObjectId(deviceId) }).exec();
  }

  async countByStatus(status: string) {
    return this.proxmoxContainerModel.countDocuments({ status }).exec();
  }

  async count() {
    return this.proxmoxContainerModel.countDocuments().exec();
  }

  async updateStatusByWatcher(watcher: string, status: string) {
    return this.proxmoxContainerModel.updateMany({ watcher }, { status }).exec();
  }
}