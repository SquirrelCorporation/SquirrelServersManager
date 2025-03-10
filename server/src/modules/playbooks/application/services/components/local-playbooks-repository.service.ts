import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  PlaybooksRepository,
  PlaybooksRepositoryDocument,
} from '../schemas/playbooks-register.schema';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import PlaybooksRepositoryEngine from '../engines/PlaybooksRepositoryEngine';
import { DIRECTORY_ROOT } from '../constants';

/**
 * Service for managing local playbooks repositories
 */
@Injectable()
export class LocalPlaybooksRepositoryService {
  private readonly logger = new Logger(LocalPlaybooksRepositoryService.name);

  constructor(
    @InjectModel(PlaybooksRepository.name)
    private readonly playbooksRepositoryModel: Model<PlaybooksRepositoryDocument>,
  ) {}

  /**
   * Initialize a local repository
   * @param directory Repository directory
   * @param name Repository name
   * @param directoryExclusionList Directory exclusion list
   * @param vaults Vaults
   * @returns The initialized repository
   */
  async initLocalRepository(
    directory: string,
    name: string,
    directoryExclusionList: string[] = [],
    vaults: string[] = [],
  ): Promise<any> {
    this.logger.log(`Initializing local repository ${name} at ${directory}`);

    try {
      const uuid = uuidv4();
      const repository = await this.playbooksRepositoryModel.create({
        name,
        type: 'local',
        enabled: true,
        uuid,
        directory: `${directory}/${uuid}`,
        directoryExclusionList,
        vaults,
      });

      // Register the repository with the engine
      await PlaybooksRepositoryEngine.registerRepository(repository);
      return repository;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error initializing local repository: ${errorMessage}`);
      throw new InternalError(`Error initializing local repository: ${errorMessage}`);
    }
  }

  /**
   * Add a local repository
   * @param name Repository name
   * @param directoryExclusionList Directory exclusion list
   * @param vaults Vaults
   */
  async addLocalRepository(
    name: string,
    directoryExclusionList: string[] = [],
    vaults: string[] = [],
  ): Promise<void> {
    this.logger.log(`Adding local repository ${name}`);

    try {
      // Create a unique directory for the repository
      const uuid = uuidv4();
      const directory = `${DIRECTORY_ROOT}/${uuid}`;

      await this.initLocalRepository(directory, name, directoryExclusionList, vaults);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error adding local repository: ${errorMessage}`);
      throw new InternalError(`Error adding local repository: ${errorMessage}`);
    }
  }

  /**
   * Update a local repository
   * @param uuid Repository UUID
   * @param name Repository name
   * @param directoryExclusionList Directory exclusion list
   * @param vaults Vaults
   */
  async updateLocalRepository(
    uuid: string,
    name: string,
    directoryExclusionList: string[] = [],
    vaults: string[] = [],
  ): Promise<void> {
    this.logger.log(`Updating local repository ${name}`);

    try {
      const repository = await this.playbooksRepositoryModel.findOne({ uuid });
      if (!repository) {
        throw new NotFoundError(`Repository with UUID ${uuid} not found`);
      }

      repository.name = name;
      repository.directoryExclusionList = directoryExclusionList;
      repository.vaults = vaults;

      await repository.save();

      // Re-register the repository with updated settings
      await PlaybooksRepositoryEngine.deregisterRepository(uuid);
      await PlaybooksRepositoryEngine.registerRepository(repository);
      await this.syncToDatabase(uuid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating local repository: ${errorMessage}`);
      throw new InternalError(`Error updating local repository: ${errorMessage}`);
    }
  }

  /**
   * Sync a local repository to database
   * @param repository Repository
   */
  async syncToDatabase(repository: string | any): Promise<void> {
    let uuid: string;

    if (typeof repository === 'string') {
      uuid = repository;
    } else {
      uuid = repository.uuid;
    }

    this.logger.log(`Syncing local repository ${uuid} to database`);

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
      this.logger.error(`Error syncing local repository to database: ${errorMessage}`);
      throw new InternalError(`Error syncing local repository to database: ${errorMessage}`);
    }
  }
}
