import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CONTAINER_CUSTOM_STACK_REPOSITORY,
  ContainerCustomStackRepositoryDocument,
} from '../schemas/container-custom-stack-repository.schema';

@Injectable()
export class ContainerCustomStacksRepositoryRepository {
  constructor(
    @InjectModel(CONTAINER_CUSTOM_STACK_REPOSITORY)
    private readonly containerCustomStackRepositoryModel: Model<ContainerCustomStackRepositoryDocument>,
  ) {}

  async create(
    containerCustomStackRepository: Partial<ContainerCustomStackRepositoryDocument>,
  ): Promise<ContainerCustomStackRepositoryDocument> {
    const created = await this.containerCustomStackRepositoryModel.create(containerCustomStackRepository);
    return created.toObject();
  }

  async findAllActive(): Promise<ContainerCustomStackRepositoryDocument[]> {
    return this.containerCustomStackRepositoryModel.find({ enabled: true }).lean().exec();
  }

  async findOneByUuid(uuid: string): Promise<ContainerCustomStackRepositoryDocument | null> {
    return this.containerCustomStackRepositoryModel.findOne({ uuid }).lean().exec();
  }

  async update(
    containerCustomStackRepository: Partial<ContainerCustomStackRepositoryDocument>,
  ): Promise<ContainerCustomStackRepositoryDocument | null> {
    containerCustomStackRepository.updatedAt = new Date();
    return this.containerCustomStackRepositoryModel
      .findOneAndUpdate(
        { uuid: containerCustomStackRepository.uuid },
        containerCustomStackRepository,
      )
      .lean()
      .exec();
  }

  async deleteByUuid(uuid: string): Promise<void> {
    await this.containerCustomStackRepositoryModel.deleteOne({ uuid }).exec();
  }
}