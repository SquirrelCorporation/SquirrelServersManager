import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IContainerCustomStackRepository } from '../../domain/repositories/container-custom-stack-repository.interface';
import {
  ContainerCustomStack,
  IContainerCustomStackRepositoryEntity,
} from '../../domain/entities/container-custom-stack.entity';
import { CONTAINER_CUSTOM_STACK } from '../../infrastructure/schemas/container-custom-stack.schema';
import { ContainerCustomStackMapper } from '../mappers/container-custom-stack.mapper';

@Injectable()
export class ContainerCustomStackRepository implements IContainerCustomStackRepository {
  constructor(
    @InjectModel(CONTAINER_CUSTOM_STACK)
    private readonly containerCustomStackModel: Model<any>,
    private readonly mapper: ContainerCustomStackMapper,
  ) {}

  async findAll(): Promise<ContainerCustomStack[]> {
    const entities = await this.containerCustomStackModel.find().lean();
    return this.mapper.toDomainList(entities);
  }

  async create(stack: ContainerCustomStack): Promise<ContainerCustomStack> {
    const persistenceEntity = this.mapper.toPersistence(stack);
    const newStack = new this.containerCustomStackModel(persistenceEntity);
    const savedEntity = await newStack.save();
    return this.mapper.toDomain(savedEntity.toObject()) as ContainerCustomStack;
  }

  async update(uuid: string, stack: Partial<ContainerCustomStack>): Promise<ContainerCustomStack> {
    const updatedEntity = await this.containerCustomStackModel
      .findOneAndUpdate({ uuid: uuid }, stack, { new: true })
      .lean();
    return this.mapper.toDomain(updatedEntity) as ContainerCustomStack;
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    const result = await this.containerCustomStackModel.deleteOne({ uuid: uuid });
    return result.deletedCount > 0;
  }

  async listAllByRepository(
    repository: IContainerCustomStackRepositoryEntity,
  ): Promise<ContainerCustomStack[]> {
    const entities = await this.containerCustomStackModel.find({ uuid: repository.uuid }).lean();
    return this.mapper.toDomainList(entities);
  }

  async updateOrCreate(stack: any): Promise<ContainerCustomStack | null> {
    const entity = await this.containerCustomStackModel
      .findOneAndUpdate({ uuid: stack.uuid }, stack, {
        upsert: true,
        new: true,
      })
      .lean();
    return this.mapper.toDomain(entity);
  }

  async findByName(name: string): Promise<ContainerCustomStack | null> {
    const entity = await this.containerCustomStackModel.findOne({ name }).lean();
    return this.mapper.toDomain(entity);
  }

  async findByUuid(uuid: string): Promise<ContainerCustomStack | null> {
    const entity = await this.containerCustomStackModel.findOne({ uuid }).lean();
    return this.mapper.toDomain(entity);
  }

  async deleteOneByUuid(uuid: string): Promise<void> {
    await this.containerCustomStackModel.deleteOne({ uuid });
  }

  async deleteAllByRepository(repository: IContainerCustomStackRepositoryEntity): Promise<void> {
    await this.containerCustomStackModel.deleteMany({ repositoryId: repository._id });
  }

  async findOneByPath(path: string): Promise<ContainerCustomStack | null> {
    const entity = await this.containerCustomStackModel.findOne({ path }).lean();
    return this.mapper.toDomain(entity);
  }
}
