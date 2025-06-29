import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IContainerCustomStackRepositoryRepository } from '../../domain/repositories/container-custom-stack-repository-repository.interface';
import { IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';
import { CONTAINER_CUSTOM_STACK_REPOSITORY } from '../../infrastructure/schemas/container-custom-stack-repository.schema';
import { ContainerCustomStackRepositoryMapper } from '../mappers/container-custom-stack-repository.mapper';

@Injectable()
export class ContainerCustomStacksRepositoryRepository
  implements IContainerCustomStackRepositoryRepository
{
  constructor(
    @InjectModel(CONTAINER_CUSTOM_STACK_REPOSITORY)
    private readonly containerCustomStackRepositoryModel: Model<any>,
    private readonly mapper: ContainerCustomStackRepositoryMapper,
  ) {}

  async findAll(): Promise<IContainerCustomStackRepositoryEntity[]> {
    const entities = await this.containerCustomStackRepositoryModel.find().lean();
    return this.mapper.toDomainList(entities);
  }

  async findByUuid(uuid: string): Promise<IContainerCustomStackRepositoryEntity | null> {
    const entity = await this.containerCustomStackRepositoryModel.findOne({ uuid: uuid }).lean();
    return this.mapper.toDomain(entity);
  }

  async findAllActive(): Promise<IContainerCustomStackRepositoryEntity[]> {
    const entities = await this.containerCustomStackRepositoryModel.find({ enabled: true }).lean();
    return this.mapper.toDomainList(entities);
  }

  async create(
    repository: IContainerCustomStackRepositoryEntity,
  ): Promise<IContainerCustomStackRepositoryEntity> {
    const persistenceEntity = this.mapper.toPersistence(repository);
    const newRepository = new this.containerCustomStackRepositoryModel(persistenceEntity);
    const savedEntity = await newRepository.save();
    return this.mapper.toDomain(savedEntity.toObject()) as IContainerCustomStackRepositoryEntity;
  }

  async update(
    uuid: string,
    repository: Partial<IContainerCustomStackRepositoryEntity>,
  ): Promise<IContainerCustomStackRepositoryEntity> {
    const updatedEntity = await this.containerCustomStackRepositoryModel
      .findOneAndUpdate({ uuid: uuid }, repository, { new: true })
      .lean();
    return this.mapper.toDomain(updatedEntity) as IContainerCustomStackRepositoryEntity;
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    const result = await this.containerCustomStackRepositoryModel.deleteOne({ uuid: uuid });
    return result.deletedCount > 0;
  }
}
