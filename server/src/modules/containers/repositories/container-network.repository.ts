import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CONTAINER_NETWORK, ContainerNetworkDocument } from '../schemas/container-network.schema';

@Injectable()
export class ContainerNetworkRepository {
  constructor(
    @InjectModel(CONTAINER_NETWORK)
    private readonly containerNetworkModel: Model<ContainerNetworkDocument>,
  ) {}

  async findAll() {
    return this.containerNetworkModel.find().populate({ path: 'device' }).lean().exec();
  }

  async create(network: Partial<ContainerNetworkDocument>) {
    return this.containerNetworkModel.create(network);
  }

  async findNetworksByWatcher(watcher: string) {
    return this.containerNetworkModel.find({ watcher }).lean().exec();
  }

  async deleteNetworkById(id: string) {
    return this.containerNetworkModel.deleteOne({ id }).exec();
  }

  async deleteByDevice(device: any) {
    return this.containerNetworkModel.deleteMany({ device }).exec();
  }
}
