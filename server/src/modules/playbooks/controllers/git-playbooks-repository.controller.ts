import { Controller, Get, Post, Put, Delete, Body, Param, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { API, Repositories } from 'ssm-shared-lib';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../../modules/ansible-vault/ansible-vault';
import { GitPlaybooksRepositoryService } from '../services/git-playbooks-repository.service';
import { PlaybooksRepositoryService } from '../services/playbooks-repository.service';
import { PlaybooksRepository, PlaybooksRepositoryDocument } from '../schemas/playbooks-repository.schema';

/**
 * Controller for managing Git playbooks repositories
 */
@Controller('playbooks-repository/git')
export class GitPlaybooksRepositoryController {
  private readonly logger = new Logger(GitPlaybooksRepositoryController.name);

  constructor(
    private readonly gitPlaybooksRepositoryService: GitPlaybooksRepositoryService,
    private readonly playbooksRepositoryService: PlaybooksRepositoryService,
    @InjectModel(PlaybooksRepository.name)
    private readonly playbooksRepositoryModel: Model<PlaybooksRepositoryDocument>
  ) {}

  /**
   * Add a Git repository
   * @param repository Repository data
   */
  @Put()
  async addGitRepository(@Body() repository: API.GitPlaybooksRepository): Promise<void> {
    this.logger.log(`Adding Git repository ${repository.name}`);
    
    const {
      name,
      accessToken,
      branch,
      email,
      userName,
      remoteUrl,
      directoryExclusionList,
      gitService,
      vaults,
      ignoreSSLErrors,
    } = repository;
    
    await this.gitPlaybooksRepositoryService.addGitRepository(
      name,
      await vaultEncrypt(accessToken as string, DEFAULT_VAULT_ID),
      branch,
      email,
      userName,
      remoteUrl,
      gitService,
      directoryExclusionList || [],
      vaults as string[],
      ignoreSSLErrors
    );
  }

  /**
   * Get all Git repositories
   * @returns List of Git repositories
   */
  @Get()
  async getGitRepositories(): Promise<API.GitPlaybooksRepository[]> {
    this.logger.log('Getting all Git repositories');
    
    const repositories = await this.playbooksRepositoryModel.find({
      type: Repositories.RepositoryType.GIT
    }).lean();
    
    return repositories.map(repo => ({
      ...repo,
      accessToken: 'REDACTED'
    })) as unknown as API.GitPlaybooksRepository[];
  }

  /**
   * Update a Git repository
   * @param uuid Repository UUID
   * @param repository Repository data
   */
  @Post(':uuid')
  async updateGitRepository(
    @Param('uuid') uuid: string,
    @Body() repository: API.GitPlaybooksRepository
  ): Promise<void> {
    this.logger.log(`Updating Git repository ${uuid}`);
    
    const {
      name,
      accessToken,
      branch,
      email,
      userName,
      remoteUrl,
      directoryExclusionList,
      gitService,
      vaults,
      ignoreSSLErrors,
    } = repository;
    
    await this.gitPlaybooksRepositoryService.updateGitRepository(
      uuid,
      name,
      await vaultEncrypt(accessToken as string, DEFAULT_VAULT_ID),
      branch,
      email,
      userName,
      remoteUrl,
      gitService,
      directoryExclusionList || [],
      vaults as string[],
      ignoreSSLErrors
    );
  }

  /**
   * Delete a Git repository
   * @param uuid Repository UUID
   */
  @Delete(':uuid')
  async deleteGitRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Deleting Git repository ${uuid}`);
    
    const repository = await this.playbooksRepositoryModel.findOne({ uuid });
    if (!repository) {
      throw new NotFoundError(`Repository ${uuid} not found`);
    }
    
    await this.playbooksRepositoryService.deleteRepository(repository as unknown as PlaybooksRepositoryDocument);
  }

  /**
   * Force pull a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/force-pull')
  async forcePullRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Force pulling Git repository ${uuid}`);
    
    await this.gitPlaybooksRepositoryService.forcePull(uuid);
  }

  /**
   * Force clone a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/force-clone')
  async forceCloneRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Force cloning Git repository ${uuid}`);
    
    await this.gitPlaybooksRepositoryService.clone(uuid);
  }

  /**
   * Commit and sync a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/commit-and-sync')
  async commitAndSyncRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Committing and syncing Git repository ${uuid}`);
    
    await this.gitPlaybooksRepositoryService.commitAndSync(uuid);
  }

  /**
   * Sync a Git repository to the database
   * @param uuid Repository UUID
   */
  @Post(':uuid/sync-to-database')
  async syncToDatabaseRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Syncing Git repository ${uuid} to database`);
    
    await this.gitPlaybooksRepositoryService.syncToDatabase(uuid);
  }

  /**
   * Force register a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/force-register')
  async forceRegister(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Force registering Git repository ${uuid}`);
    
    const repository = await this.playbooksRepositoryModel.findOne({ uuid });
    if (!repository) {
      throw new NotFoundError(`Repository ${uuid} not found`);
    }
    
    await this.gitPlaybooksRepositoryService.registerRepository(repository);
  }
} 