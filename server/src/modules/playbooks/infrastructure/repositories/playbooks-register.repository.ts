import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPlaybooksRegisterRepository } from '@modules/playbooks/domain/repositories/playbooks-register-repository.interface';
import { IPlaybooksRegister } from '@modules/playbooks/domain/entities/playbooks-register.entity';
import {
  PlaybooksRegisterDocument,

} from '../schemas/playbooks-register.schema';
import { NotFoundError } from '../../../middlewares/api/ApiError';

/**
 * Repository for accessing playbooks repository data in the database
 */
@Injectable()
export class PlaybooksRegisterRepository implements IPlaybooksRegisterRepository {
  private readonly logger = new Logger(PlaybooksRegisterRepository.name);

  constructor(
    @InjectModel(PLAYBOOKS_REGISTER_DOCUMENT)
    private readonly playbooksRegisterModel: Model<PlaybooksRegisterDocument>,
  ) {}

  /**
   * Find a repository by UUID
   * @param uuid Repository UUID
   * @returns The repository or null if not found
   */
  async findByUuid(uuid: string): Promise<IPlaybooksRegister| null> {
    this.logger.debug(`Finding repository with UUID: ${uuid}`);
    return this.playbooksRegisterModel.findOne({ uuid }).exec();
  }

  /**
   * Find all active repositories
   * @returns Array of active repositories
   */
  async findAllActive(): Promise<IPlaybooksRegister[]> {
    this.logger.debug('Finding all active repositories');
    return this.playbooksRegisterModel.find({ enabled: true }).exec();
  }

  /**
   * Find a repository by UUID and ensure it exists
   * @param uuid Repository UUID
   * @returns The repository
   * @throws NotFoundError if the repository is not found
   */
  async findByUuidOrFail(uuid: string): Promise<IPlaybooksRegister> {
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
    updateData: Partial<IPlaybooksRegister>,
  ): Promise<IPlaybooksRegister | null> {
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
  async create(repositoryData: Partial<IPlaybooksRegister>): Promise<IPlaybooksRegister> {
    this.logger.debug(`Creating new repository: ${repositoryData.name}`);
    return this.playbooksRepositoryModel.create(repositoryData);
  }

  /**
   * Delete a repository
   * @param uuid Repository UUID
   * @returns The deleted repository
   */
  async delete(uuid: string): Promise<IPlaybooksRegister | null> {
    this.logger.debug(`Deleting repository with UUID: ${uuid}`);
    return this.playbooksRepositoryModel.findOneAndDelete({ uuid }).exec();
  }
}
