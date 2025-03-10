import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PlaybooksRepository,
  PlaybooksRepositoryDocument,
} from '../schemas/playbooks-register.schema';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { PLAYBOOKS_REPOSITORY_DOCUMENT } from '../constants';
import { IPlaybooksRepositoryRepository } from '../../domain/repositories/playbooks-register-repository.interface';
import { IPlaybooksRepository } from '../../domain/entities/playbooks-register.entity';

/**
 * Repository for accessing playbooks repository data in the database
 */
@Injectable()
export class PlaybooksRegisterRepository implements IPlaybooksRepositoryRepository {
  private readonly logger = new Logger(PlaybooksRegisterRepository.name);

  constructor(
    @InjectModel(PLAYBOOKS_REPOSITORY_DOCUMENT)
    private readonly playbooksRepositoryModel: Model<PlaybooksRepositoryDocument>,
  ) {}

  /**
   * Find a repository by UUID
   * @param uuid Repository UUID
   * @returns The repository or null if not found
   */
  async findByUuid(uuid: string): Promise<IPlaybooksRepository | null> {
    this.logger.debug(`Finding repository with UUID: ${uuid}`);
    return this.playbooksRepositoryModel.findOne({ uuid }).exec();
  }

  /**
   * Find all active repositories
   * @returns Array of active repositories
   */
  async findAllActive(): Promise<IPlaybooksRepository[]> {
    this.logger.debug('Finding all active repositories');
    return this.playbooksRepositoryModel.find({ enabled: true }).exec();
  }

  /**
   * Find a repository by UUID and ensure it exists
   * @param uuid Repository UUID
   * @returns The repository
   * @throws NotFoundError if the repository is not found
   */
  async findByUuidOrFail(uuid: string): Promise<IPlaybooksRepository> {
    const repository = await this.findByUuid(uuid);
    if (!repository) {
      throw new NotFoundError(`Repository with UUID ${uuid} not found`);
    }
    return repository;
  }

  /**
   * Update a repository
   * @param uuid Repository UUID
   * @param updateData Data to update
   * @returns The updated repository
   */
  async update(
    uuid: string,
    updateData: Partial<IPlaybooksRepository>,
  ): Promise<IPlaybooksRepository | null> {
    this.logger.debug(`Updating repository with UUID: ${uuid}`);
    return this.playbooksRepositoryModel
      .findOneAndUpdate({ uuid }, { $set: updateData }, { new: true })
      .exec();
  }

  /**
   * Create a new repository
   * @param repositoryData Repository data
   * @returns The created repository
   */
  async create(repositoryData: Partial<IPlaybooksRepository>): Promise<IPlaybooksRepository> {
    this.logger.debug(`Creating new repository: ${repositoryData.name}`);
    return this.playbooksRepositoryModel.create(repositoryData);
  }

  /**
   * Delete a repository
   * @param uuid Repository UUID
   * @returns The deleted repository
   */
  async delete(uuid: string): Promise<IPlaybooksRepository | null> {
    this.logger.debug(`Deleting repository with UUID: ${uuid}`);
    return this.playbooksRepositoryModel.findOneAndDelete({ uuid }).exec();
  }
}
