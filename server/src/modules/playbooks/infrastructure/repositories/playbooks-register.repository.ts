import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Repositories } from 'ssm-shared-lib';
import { IPlaybooksRegisterRepository } from '../../domain/repositories/playbooks-register-repository.interface';
import { IPlaybooksRegister } from '../../domain/entities/playbooks-register.entity';
import { PlaybooksRegister, PlaybooksRegisterDocument } from '../schemas/playbooks-register.schema';

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

  /**
   * Find a repository by UUID
   * @param uuid Repository UUID
   * @returns The repository or null if not found
   */
  async findByUuid(uuid: string): Promise<IPlaybooksRegister | null> {
    this.logger.log(`Finding repository with UUID: ${uuid}`);
    const doc = await this.playbooksRegisterModel.findOne({ uuid }).lean().exec();
    return doc as IPlaybooksRegister | null;
  }

  /**
   * Find all active repositories
   * @returns Array of active repositories
   */
  async findAllActive(): Promise<IPlaybooksRegister[]> {
    this.logger.debug('Finding all active repositories');
    const docs = await this.playbooksRegisterModel.find({ enabled: true }).lean().exec();
    return docs.map((e) => e as unknown as IPlaybooksRegister);
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
      .lean()
      .exec();
    return doc as IPlaybooksRegister | null;
  }

  /**
   * Create a new repository
   * @param repositoryData Repository data
   * @returns The created repository
   */
  async create(repositoryData: Partial<IPlaybooksRegister>): Promise<IPlaybooksRegister> {
    this.logger.debug(`Creating new repository: ${repositoryData.name}`);
    const doc = await this.playbooksRegisterModel.create(repositoryData);
    return doc as IPlaybooksRegister;
  }

  /**
   * Delete a repository
   * @param uuid Repository UUID
   * @returns The deleted repository
   */
  async delete(uuid: string): Promise<IPlaybooksRegister | null> {
    this.logger.debug(`Deleting repository with UUID: ${uuid}`);
    const doc = await this.playbooksRegisterModel.findOneAndDelete({ uuid }).lean().exec();
    return doc as IPlaybooksRegister | null;
  }

  async findAllByType(type: Repositories.RepositoryType): Promise<IPlaybooksRegister[]> {
    this.logger.debug(`Finding all repositories with type: ${type}`);
    const docs = await this.playbooksRegisterModel.find({ type }).lean().exec();
    return docs.map((e) => e as unknown as IPlaybooksRegister);
  }
}
