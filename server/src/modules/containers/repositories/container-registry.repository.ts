import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CONTAINER_REGISTRY,
  ContainerRegistryDocument,
} from '../schemas/container-registry.schema';

@Injectable()
export class ContainerRegistryRepository {
  constructor(
    @InjectModel(CONTAINER_REGISTRY)
    private readonly containerRegistryModel: Model<ContainerRegistryDocument>,
  ) {}

  async findAll() {
    return this.containerRegistryModel.find().lean().exec();
  }

  async findOneByProvider(provider: string) {
    return this.containerRegistryModel.findOne({ provider }).lean().exec();
  }

  async findOneByName(name: string) {
    return this.containerRegistryModel.findOne({ name }).lean().exec();
  }

  async findMany(filter: any) {
    return this.containerRegistryModel.find(filter).lean().exec();
  }

  async updateOne(registry: ContainerRegistryDocument) {
    return this.containerRegistryModel.updateOne({ _id: registry._id }, registry).exec();
  }

  async create(containerRegistry: Partial<ContainerRegistryDocument>) {
    const createdObject = await this.containerRegistryModel.create(containerRegistry);
    return createdObject.toObject();
  }

  async deleteOne(registry: ContainerRegistryDocument) {
    return this.containerRegistryModel.deleteOne({ _id: registry._id });
  }
}
