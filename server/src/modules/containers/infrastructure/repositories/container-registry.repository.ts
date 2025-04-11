import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IContainerRegistryRepository } from '../../domain/repositories/container-registry-repository.interface';
import { IContainerRegistryEntity } from '../../domain/entities/container-registry.entity';
import {
  CONTAINER_REGISTRY_SCHEMA,
  ContainerRegistryDocument,
} from '../schemas/container-registry.schema';
import { ContainerRegistryMapper } from '../mappers/container-registry.mapper';

@Injectable()
export class ContainerRegistryRepository implements IContainerRegistryRepository {
  constructor(
    @InjectModel(CONTAINER_REGISTRY_SCHEMA)
    private readonly containerRegistryModel: Model<ContainerRegistryDocument>,
  ) {}

  /**
   * Find all container registries
   */
  async findAll(): Promise<IContainerRegistryEntity[]> {
    const documents = await this.containerRegistryModel.find().lean().exec();
    return ContainerRegistryMapper.toEntities(documents);
  }

  /**
   * Find one registry by provider
   * @param provider Registry provider
   */
  async findOneByProvider(provider: string): Promise<IContainerRegistryEntity | null> {
    const document = await this.containerRegistryModel.findOne({ provider }).lean().exec();
    return ContainerRegistryMapper.toEntity(document);
  }

  /**
   * Find one registry by name
   * @param name Registry name
   */
  async findOneByName(name: string): Promise<IContainerRegistryEntity | null> {
    const document = await this.containerRegistryModel.findOne({ name }).lean().exec();
    return ContainerRegistryMapper.toEntity(document);
  }

  /**
   * Find multiple registries by filter
   * @param filter Filter criteria
   */
  async findMany(filter: any): Promise<IContainerRegistryEntity[]> {
    const documents = await this.containerRegistryModel.find(filter).lean().exec();
    return ContainerRegistryMapper.toEntities(documents);
  }

  /**
   * Update a registry
   * @param id Registry ID
   * @param registry Updated registry data
   */
  async update(
    id: string,
    registry: Partial<IContainerRegistryEntity>,
  ): Promise<IContainerRegistryEntity> {
    const documentData = ContainerRegistryMapper.toDocument(registry);
    await this.containerRegistryModel.updateOne({ _id: id }, documentData).exec();
    const updatedDocument = await this.containerRegistryModel
      .findById(id)
      .populate('device')
      .lean()
      .exec();

    return ContainerRegistryMapper.toEntity(updatedDocument) as IContainerRegistryEntity;
  }

  /**
   * Create a new registry
   * @param registry Registry data
   */
  async create(registry: Partial<IContainerRegistryEntity>): Promise<IContainerRegistryEntity> {
    const documentData = ContainerRegistryMapper.toDocument(registry);
    const createdDocument = await this.containerRegistryModel.create(documentData);
    return ContainerRegistryMapper.toEntity(createdDocument) as IContainerRegistryEntity;
  }

  /**
   * Delete a registry
   * @param id Registry ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.containerRegistryModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
