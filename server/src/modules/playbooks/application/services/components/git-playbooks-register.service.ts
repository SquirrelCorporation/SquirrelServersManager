import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SsmGit } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import {
  PlaybooksRegister,
} from '../../../infrastructure/schemas/playbooks-register.schema';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import PlaybooksRepositoryEngine from '../engines/PlaybooksRepositoryEngine';

/**
 * Service for managing Git playbooks repositories
 */
@Injectable()
export class GitPlaybooksRegisterService {
  private readonly logger = new Logger(GitPlaybooksRegisterService.name);

  constructor(
    @InjectModel(PlaybooksRegister.name)
    private readonly playbooksRepositoryModel: Model<PlaybooksRepositoryDocument>,
  ) {}

  /**
   * Add a Git repository
   * @param name Repository name
   * @param accessToken Access token
   * @param branch Branch
   * @param email Email
   * @param userName Username
   * @param remoteUrl Remote URL
   * @param gitService Git service
   * @param directoryExclusionList Directory exclusion list
   * @param vaults Vaults
   * @param ignoreSSLErrors Ignore SSL errors
   */
  async addGitRepository(
    name: string,
    accessToken: string,
    branch: string,
    email: string,
    userName: string,
    remoteUrl: string,
    gitService: SsmGit.Services,
    directoryExclusionList: string[],
    vaults: string[],
    ignoreSSLErrors?: boolean,
  ): Promise<void> {
    this.logger.log(`Adding Git repository ${name}`);

    try {
      const repository = await this.playbooksRepositoryModel.create({
        name,
        type: 'git',
        enabled: true,
        uuid: uuidv4(),
        accessToken,
        branch,
        email,
        userName,
        remoteUrl,
        gitService,
        directoryExclusionList,
        vaults,
        ignoreSSLErrors,
      });

      // Register the repository with the engine
      await PlaybooksRepositoryEngine.registerRepository(repository);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error adding Git repository: ${errorMessage}`);
      throw new InternalError(`Error adding Git repository: ${errorMessage}`);
    }
  }

  /**
   * Update a Git repository
   * @param uuid Repository UUID
   * @param name Repository name
   * @param accessToken Access token
   * @param branch Branch
   * @param email Email
   * @param userName Username
   * @param remoteUrl Remote URL
   * @param gitService Git service
   * @param directoryExclusionList Directory exclusion list
   * @param vaults Vaults
   * @param ignoreSSLErrors Ignore SSL errors
   */
  async updateGitRepository(
    uuid: string,
    name: string,
    accessToken: string,
    branch: string,
    email: string,
    userName: string,
    remoteUrl: string,
    gitService: SsmGit.Services,
    directoryExclusionList: string[],
    vaults: string[],
    ignoreSSLErrors?: boolean,
  ): Promise<void> {
    this.logger.log(`Updating Git repository ${name}`);

    try {
      const repository = await this.playbooksRepositoryModel.findOne({ uuid });
      if (!repository) {
        throw new NotFoundError(`Repository with UUID ${uuid} not found`);
      }

      repository.name = name;
      repository.accessToken = accessToken;
      repository.branch = branch;
      repository.email = email;
      repository.userName = userName;
      repository.remoteUrl = remoteUrl;
      repository.gitService = gitService;
      repository.directoryExclusionList = directoryExclusionList;
      repository.vaults = vaults;
      repository.ignoreSSLErrors = ignoreSSLErrors;

      await repository.save();

      // Re-register the repository with updated settings
      await PlaybooksRepositoryEngine.deregisterRepository(uuid);
      await PlaybooksRepositoryEngine.registerRepository(repository);
      await this.syncToDatabase(uuid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating Git repository: ${errorMessage}`);
      throw new InternalError(`Error updating Git repository: ${errorMessage}`);
    }
  }

  /**
   * Force pull a Git repository
   * @param uuid Repository UUID
   */
  async forcePull(uuid: string): Promise<void> {
    this.logger.log(`Force pulling Git repository ${uuid}`);

    try {
      const repository = await this.playbooksRepositoryModel.findOne({ uuid });
      if (!repository) {
        throw new NotFoundError(`Repository with UUID ${uuid} not found`);
      }

      const playbooksRepositoryComponent = PlaybooksRepositoryEngine.getState().playbooksRepository[
        repository.uuid
      ] as any;

      if (!playbooksRepositoryComponent) {
        throw new InternalError('Repository is not registered, try restarting or force sync');
      }

      if (typeof playbooksRepositoryComponent.forcePull === 'function') {
        await playbooksRepositoryComponent.forcePull();
      } else {
        throw new InternalError('Repository does not support force pull operation');
      }

      await this.syncToDatabase(uuid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error force pulling Git repository: ${errorMessage}`);
      throw new InternalError(`Error force pulling Git repository: ${errorMessage}`);
    }
  }

  /**
   * Clone a Git repository
   * @param uuid Repository UUID
   */
  async clone(uuid: string): Promise<void> {
    this.logger.log(`Cloning Git repository ${uuid}`);

    try {
      const repository = await this.playbooksRepositoryModel.findOne({ uuid });
      if (!repository) {
        throw new NotFoundError(`Repository with UUID ${uuid} not found`);
      }

      await PlaybooksRepositoryEngine.deregisterRepository(uuid);
      await PlaybooksRepositoryEngine.registerRepository(repository);
      await this.syncToDatabase(uuid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error cloning Git repository: ${errorMessage}`);
      throw new InternalError(`Error cloning Git repository: ${errorMessage}`);
    }
  }

  /**
   * Commit and sync a Git repository
   * @param uuid Repository UUID
   */
  async commitAndSync(uuid: string): Promise<void> {
    this.logger.log(`Committing and syncing Git repository ${uuid}`);

    try {
      const repository = await this.playbooksRepositoryModel.findOne({ uuid });
      if (!repository) {
        throw new NotFoundError(`Repository with UUID ${uuid} not found`);
      }

      const playbooksRepositoryComponent = PlaybooksRepositoryEngine.getState().playbooksRepository[
        repository.uuid
      ] as any;

      if (!playbooksRepositoryComponent) {
        throw new InternalError('Repository is not registered, try restarting or force sync');
      }

      if (typeof playbooksRepositoryComponent.commitAndSync === 'function') {
        await playbooksRepositoryComponent.commitAndSync();
      } else {
        throw new InternalError('Repository does not support commit and sync operation');
      }

      await this.syncToDatabase(uuid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error committing and syncing Git repository: ${errorMessage}`);
      throw new InternalError(`Error committing and syncing Git repository: ${errorMessage}`);
    }
  }

  /**
   * Sync a Git repository from remote
   * @param repository Repository
   */
  async syncFromRemote(repository: any): Promise<void> {
    this.logger.log(`Syncing Git repository ${repository.name} from remote`);

    try {
      const playbooksRepositoryComponent = PlaybooksRepositoryEngine.getState().playbooksRepository[
        repository.uuid
      ] as any;

      if (!playbooksRepositoryComponent) {
        throw new InternalError('Repository is not registered, try restarting or force sync');
      }

      if (typeof playbooksRepositoryComponent.forcePull === 'function') {
        await playbooksRepositoryComponent.forcePull();
      } else {
        throw new InternalError('Repository does not support force pull operation');
      }

      await this.syncToDatabase(repository.uuid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error syncing Git repository from remote: ${errorMessage}`);
      throw new InternalError(`Error syncing Git repository from remote: ${errorMessage}`);
    }
  }

  /**
   * Sync a Git repository to database
   * @param repository Repository
   */
  async syncToDatabase(repository: string | any): Promise<void> {
    let uuid: string;

    if (typeof repository === 'string') {
      uuid = repository;
    } else {
      uuid = repository.uuid;
    }

    this.logger.log(`Syncing Git repository ${uuid} to database`);

    try {
      const playbooksRepositoryComponent = PlaybooksRepositoryEngine.getState().playbooksRepository[
        uuid
      ] as any;

      if (!playbooksRepositoryComponent) {
        throw new InternalError('Repository is not registered, try restarting or force sync');
      }

      if (typeof playbooksRepositoryComponent.syncToDatabase === 'function') {
        await playbooksRepositoryComponent.syncToDatabase();
      } else {
        throw new InternalError('Repository does not support sync to database operation');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error syncing Git repository to database: ${errorMessage}`);
      throw new InternalError(`Error syncing Git repository to database: ${errorMessage}`);
    }
  }

  /**
   * Register a Git repository
   * @param repository Repository
   */
  async registerRepository(repository: any): Promise<void> {
    this.logger.log(`Registering Git repository ${repository.name}`);

    try {
      await PlaybooksRepositoryEngine.registerRepository(repository);
      await this.syncToDatabase(repository.uuid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error registering Git repository: ${errorMessage}`);
      throw new InternalError(`Error registering Git repository: ${errorMessage}`);
    }
  }
}
