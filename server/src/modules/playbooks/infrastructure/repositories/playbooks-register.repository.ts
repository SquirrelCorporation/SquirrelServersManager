import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPlaybooksRegisterRepository } from '../../domain/repositories/playbooks-register-repository.interface';
import { IPlaybooksRegister } from '../../domain/entities/playbooks-register.entity';
import {
  PlaybooksRegister,
  PlaybooksRegisterDocument
} from '../schemas/playbooks-register.schema';

/**
 * Repository for accessing playbooks repository data in the database
 */
@Injectable()
export class PlaybooksRegisterRepository implements IPlaybooksRegisterRepository {
  private readonly logger = new Logger(PlaybooksRegisterRepository.name);

  constructor(
    @InjectModel(PlaybooksRegister.name)
    private readonly playbooksRegisterModel: Model<PlaybooksRegisterDocument>,
  ) {}

  private toEntity(doc: PlaybooksRegisterDocument | null): IPlaybooksRegister | null {
    if (!doc) {return null;}
    return {
      uuid: doc.uuid,
      name: doc.name,
      enabled: doc.enabled,
      tree: doc.tree,
      type: doc.type,
      directory: doc.directory,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Find a repository by UUID
   * @param uuid Repository UUID
   * @returns The repository or null if not found
   */
  async findByUuid(uuid: string): Promise<IPlaybooksRegister | null> {
    this.logger.debug(`Finding repository with UUID: ${uuid}`);
    const doc = await this.playbooksRegisterModel.findOne({ uuid }).exec();
    return this.toEntity(doc);
  }

  /**
   * Find all active repositories
   * @returns Array of active repositories
   */
  async findAllActive(): Promise<IPlaybooksRegister[]> {
    this.logger.debug('Finding all active repositories');
    const docs = await this.playbooksRegisterModel.find({ enabled: true }).exec();
    return docs.map(doc => this.toEntity(doc)).filter((entity): entity is IPlaybooksRegister => entity !== null);
  }

  /**
   * Update a repository
   * @param uuid Repository UUID
   * @param updateData Data to update
   * @returns The updated repository
   */
  async update(
    uuid: string,
    updateData: Partial<IPlaybooksRegister>,
  ): Promise<IPlaybooksRegister | null> {
    this.logger.debug(`Updating repository with UUID: ${uuid}`);
    const doc = await this.playbooksRegisterModel
      .findOneAndUpdate({ uuid }, { $set: updateData }, { new: true })
      .exec();
    return this.toEntity(doc);
  }

  /**
   * Create a new repository
   * @param repositoryData Repository data
   * @returns The created repository
   */
  async create(repositoryData: Partial<IPlaybooksRegister>): Promise<IPlaybooksRegister> {
    this.logger.debug(`Creating new repository: ${repositoryData.name}`);
    const doc = await this.playbooksRegisterModel.create(repositoryData);
    const entity = this.toEntity(doc);
    if (!entity) {throw new Error('Failed to create repository');}
    return entity;
  }

  /**
   * Delete a repository
   * @param uuid Repository UUID
   * @returns The deleted repository
   */
  async delete(uuid: string): Promise<IPlaybooksRegister | null> {
    this.logger.debug(`Deleting repository with UUID: ${uuid}`);
    const doc = await this.playbooksRegisterModel.findOneAndDelete({ uuid }).exec();
    return this.toEntity(doc);
  }

  async findAllByType(type: any): Promise<IPlaybooksRegister[]> {
    this.logger.debug(`Finding all repositories with type: ${type}`);
    const docs = await this.playbooksRegisterModel.find({ type }).exec();
    return docs.map(doc => this.toEntity(doc)).filter((entity): entity is IPlaybooksRegister => entity !== null);
  }
}
