import { Controller, Get, Post, Put, Delete, Body, Param, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { API, Repositories } from 'ssm-shared-lib';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { LocalPlaybooksRepositoryService } from '../services/local-playbooks-repository.service';
import { PlaybooksRepositoryService } from '../services/playbooks-repository.service';
import { PlaybooksRepository, PlaybooksRepositoryDocument } from '../schemas/playbooks-repository.schema';

/**
 * Controller for managing local playbooks repositories
 */
@Controller('playbooks-repository/local')
export class LocalPlaybooksRepositoryController {
  private readonly logger = new Logger(LocalPlaybooksRepositoryController.name);

  constructor(
    private readonly localPlaybooksRepositoryService: LocalPlaybooksRepositoryService,
    private readonly playbooksRepositoryService: PlaybooksRepositoryService,
    @InjectModel(PlaybooksRepository.name)
    private readonly playbooksRepositoryModel: Model<PlaybooksRepositoryDocument>
  ) {}

  /**
   * Get all local repositories
   * @returns List of local repositories
   */
  @Get()
  async getLocalRepositories(): Promise<API.LocalPlaybooksRepository[]> {
    this.logger.log('Getting all local repositories');
    
    const repositories = await this.playbooksRepositoryModel.find({
      type: Repositories.RepositoryType.LOCAL
    });
    
    return repositories as unknown as API.LocalPlaybooksRepository[];
  }

  /**
   * Update a local repository
   * @param uuid Repository UUID
   * @param repository Repository data
   */
  @Post(':uuid')
  async updateLocalRepository(
    @Param('uuid') uuid: string,
    @Body() repository: API.LocalPlaybooksRepository
  ): Promise<void> {
    this.logger.log(`Updating local repository ${uuid}`);
    
    const { name, directoryExclusionList, vaults } = repository;
    
    await this.localPlaybooksRepositoryService.updateLocalRepository(
      uuid,
      name,
      directoryExclusionList,
      vaults as string[]
    );
  }

  /**
   * Delete a local repository
   * @param uuid Repository UUID
   */
  @Delete(':uuid')
  async deleteLocalRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Deleting local repository ${uuid}`);
    
    const repository = await this.playbooksRepositoryModel.findOne({ uuid });
    if (!repository) {
      throw new NotFoundError(`Repository ${uuid} not found`);
    }
    
    await this.playbooksRepositoryService.deleteRepository(repository as unknown as PlaybooksRepositoryDocument);
  }

  /**
   * Add a local repository
   * @param repository Repository data
   */
  @Put()
  async addLocalRepository(@Body() repository: API.LocalPlaybooksRepository): Promise<void> {
    this.logger.log(`Adding local repository ${repository.name}`);
    
    const { name, directoryExclusionList, vaults } = repository;
    
    await this.localPlaybooksRepositoryService.addLocalRepository(
      name,
      directoryExclusionList,
      vaults as string[]
    );
  }

  /**
   * Sync a local repository to the database
   * @param uuid Repository UUID
   */
  @Post(':uuid/sync-to-database')
  async syncToDatabaseLocalRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Syncing local repository ${uuid} to database`);
    
    const repository = await this.playbooksRepositoryModel.findOne({ uuid });
    if (!repository) {
      throw new NotFoundError(`Repository ${uuid} not found`);
    }
    
    await this.localPlaybooksRepositoryService.syncToDatabase(repository);
  }
} 