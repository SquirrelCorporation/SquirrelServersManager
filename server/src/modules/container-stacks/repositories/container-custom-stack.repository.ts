import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CONTAINER_CUSTOM_STACK, ContainerCustomStackDocument } from '../schemas/container-custom-stack.schema';
import { ContainerCustomStackRepositoryDocument } from '../schemas/container-custom-stack-repository.schema';

@Injectable()
export class ContainerCustomStackRepository {
  constructor(
    @InjectModel(CONTAINER_CUSTOM_STACK)
    private readonly containerCustomStackModel: Model<ContainerCustomStackDocument>,
  ) {}

  async findAll(): Promise<ContainerCustomStackDocument[]> {
    return this.containerCustomStackModel.find().lean().exec();
  }

  async updateOrCreate(stack: Partial<ContainerCustomStackDocument>): Promise<ContainerCustomStackDocument> {
    return this.containerCustomStackModel
      .findOneAndUpdate({ uuid: stack.uuid }, stack, {
        upsert: true,
        new: true,
      })
      .lean()
      .exec();
  }

  async findByName(name: string): Promise<ContainerCustomStackDocument | null> {
    return this.containerCustomStackModel.findOne({ name }).lean().exec();
  }

  async findByUuid(uuid: string): Promise<ContainerCustomStackDocument | null> {
    return this.containerCustomStackModel.findOne({ uuid }).lean().exec();
  }

  async deleteOne(uuid: string): Promise<void> {
    await this.containerCustomStackModel.deleteOne({ uuid }).exec();
  }

  async listAllByRepository(
    containerCustomStackRepository: ContainerCustomStackRepositoryDocument,
  ): Promise<ContainerCustomStackDocument[]> {
    return this.containerCustomStackModel
      .find({
        containerCustomStackRepository,
      })
      .lean()
      .exec();
  }

  async deleteAllByRepository(
    containerCustomStackRepository: ContainerCustomStackRepositoryDocument,
  ): Promise<void> {
    await this.containerCustomStackModel
      .deleteMany({
        containerCustomStackRepository,
      })
      .exec();
  }

  async findOneByPath(path: string): Promise<ContainerCustomStackDocument | null> {
    return this.containerCustomStackModel.findOne({ path }).lean().exec();
  }
}