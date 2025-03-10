import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { API } from 'ssm-shared-lib';
import { FileSystemService } from '@modules/shell';
import { PlaybookFileService } from '@modules/shell';
import { Model } from 'mongoose';
import {
  PlaybooksRegister,
  PlaybooksRegisterDocument,
} from '../../infrastructure/schemas/playbooks-register.schema';
import { Playbook, PlaybookDocument } from '../../infrastructure/schemas/playbook.schema';
import { ForbiddenError, InternalError, NotFoundError } from '../../../../middlewares/api/ApiError';
import { recursiveTreeCompletion } from '../../utils/tree-utils';
import { PlaybooksRegisterEngineService } from './components/playbooks-register-engine.service';

/**
 * Service for managing playbooks repositories
 */
@Injectable()
export class PlaybooksRegisterService implements OnModuleInit {
  private readonly logger = new Logger(PlaybooksRegisterService.name);

  constructor(
    @InjectModel(PlaybooksRegister.name)
    private readonly playbooksRegisterModel: Model<PlaybooksRegisterDocument>,
    @InjectModel(Playbook.name)
    private readonly playbookModel: Model<PlaybookDocument>,
    @Inject(PlaybooksRegisterEngineService)
    private readonly playbooksRegisterEngineService: PlaybooksRegisterEngineService,
    @Inject(FileSystemService)
    private readonly fileSystemService: FileSystemService,
    @Inject(PlaybookFileService)
    private readonly playbookFileService: PlaybookFileService,
  ) {}

  /**
   * Initialize the service
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing PlaybooksRepositoryService');
    try {
      // Register all active repositories
      const repositories = await this.playbooksRegisterModel.find({ enabled: true });
      for (const repository of repositories) {
        try {
          await this.playbooksRegisterEngineService.registerRepository(repository);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to register repository ${repository.name}: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error initializing repositories: ${errorMessage}`);
    }
  }

  /**
   * Get all playbooks repositories
   * @returns Array of playbooks repositories
   */
  async getAllPlaybooksRepositories(): Promise<any[]> {
    try {
      const listOfPlaybooksRepositories = await this.playbooksRegisterModel
        .find({ enabled: true })
        .lean();
      if (!listOfPlaybooksRepositories) {
        return [];
      }

      const substitutedListOfPlaybooks = listOfPlaybooksRepositories.map(
        async (playbookRepository) => {
          this.logger.debug(`getAllPlaybooksRepositories - processing ${playbookRepository.name}`);
          return {
            name: playbookRepository.name,
            children: await recursiveTreeCompletion(playbookRepository.tree),
            type: playbookRepository.type,
            uuid: playbookRepository.uuid,
            path: playbookRepository.directory,
            default: playbookRepository.default,
          };
        },
      );

      return (await Promise.all(substitutedListOfPlaybooks)).sort((a, b) =>
        b.default ? 1 : a.default ? 1 : a.name.localeCompare(b.name),
      ) as API.PlaybooksRepository[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting all playbooks repositories: ${errorMessage}`);
      throw new InternalError(`Error getting all playbooks repositories: ${errorMessage}`);
    }
  }

  /**
   * Create a directory in a playbook repository
   * @param repository The repository to create the directory in
   * @param path The path of the directory to create
   * @returns Promise that resolves when the directory is created
   */
  async createDirectoryInPlaybookRepository(
    repository: PlaybooksRegisterDocument,
    path: string,
  ): Promise<void> {
    const playbooksRepositoryComponent = this.playbooksRegisterEngineService.getState()[
      repository.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRepositoryComponent) {
      throw new InternalError('Repository is not registered, try restarting or force sync');
    }

    if (!playbooksRepositoryComponent.fileBelongToRepository(path)) {
      throw new ForbiddenError("The selected path doesn't seem to belong to the repository");
    }

    this.fileSystemService.createDirectory(path, playbooksRepositoryComponent.rootPath);
    await playbooksRepositoryComponent.updateDirectoriesTree();
  }

  /**
   * Create a playbook in a repository
   * @param repository The repository to create the playbook in
   * @param fullPath The path of the playbook
   * @param name The name of the playbook
   * @returns The created playbook
   */
  async createPlaybookInRepository(
    repository: PlaybooksRegisterDocument,
    fullPath: string,
    name: string,
  ): Promise<any> {
    const playbooksRepositoryComponent = this.playbooksRegisterEngineService.getState()[
      repository.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRepositoryComponent) {
      throw new InternalError(`PlaybookRepository doesn't seem registered`);
    }

    if (!playbooksRepositoryComponent.fileBelongToRepository(fullPath)) {
      throw new ForbiddenError("The selected path doesn't seem to belong to the repository");
    }

    const playbook = await this.playbookModel.create({
      name: name,
      custom: true,
      path: fullPath + '.yml',
      playbooksRepository: repository,
      playableInBatch: true,
    });

    this.playbookFileService.newPlaybook(fullPath + '.yml');
    await playbooksRepositoryComponent.syncToDatabase();
    return playbook;
  }

  /**
   * Delete a playbook from a repository
   * @param repository The repository to delete the playbook from
   * @param playbookUuid The UUID of the playbook to delete
   */
  async deletePlaybookFromRepository(
    repository: PlaybooksRegisterDocument,
    playbookUuid: string,
  ): Promise<void> {
    const playbook = await this.playbookModel.findOne({ uuid: playbookUuid });
    if (!playbook) {
      throw new NotFoundError(`Playbook with UUID ${playbookUuid} not found`);
    }

    const playbooksRepositoryComponent = this.playbooksRegisterEngineService.getState()[
      repository.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRepositoryComponent) {
      throw new InternalError(`PlaybookRepository doesn't seem registered`);
    }

    await this.playbookModel.deleteOne({ uuid: playbookUuid });
    this.playbookFileService.deletePlaybook(playbook.path);
    await playbooksRepositoryComponent.syncToDatabase();
  }

  /**
   * Delete a directory from a repository
   * @param repository The repository to delete the directory from
   * @param path The path of the directory to delete
   */
  async deleteDirectoryFromRepository(
    repository: PlaybooksRegisterDocument,
    path: string,
  ): Promise<void> {
    const playbooksRepositoryComponent = this.playbooksRegisterEngineService.getState()[
      repository.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRepositoryComponent) {
      throw new InternalError(`PlaybookRepository doesn't seem registered`);
    }

    if (!playbooksRepositoryComponent.fileBelongToRepository(path)) {
      throw new ForbiddenError("The selected path doesn't seem to belong to the repository");
    }

    this.fileSystemService.deleteFiles(path, playbooksRepositoryComponent.rootPath);
    await playbooksRepositoryComponent.syncToDatabase();
  }

  /**
   * Save a playbook
   * @param playbookUuid The UUID of the playbook to save
   * @param content The content of the playbook
   */
  async savePlaybook(playbookUuid: string, content: string): Promise<void> {
    const playbook = await this.playbookModel.findOne({ uuid: playbookUuid }).populate(
      'playbooksRepository',
    );
    if (!playbook) {
      throw new NotFoundError(`Playbook with UUID ${playbookUuid} not found`);
    }

    this.fileSystemService.writeFile(content, playbook.path);
  }

  /**
   * Sync a repository
   * @param repositoryUuid The UUID of the repository to sync
   */
  async syncRepository(repositoryUuid: string): Promise<void> {
    try {
      const repository = await this.playbooksRegisterModel.findOne({ uuid: repositoryUuid });
      if (!repository) {
        throw new NotFoundError(`Repository with UUID ${repositoryUuid} not found`);
      }

      const playbooksRepositoryComponent =
        this.playbooksRegisterEngineService.getState()[repository.uuid];
      if (!playbooksRepositoryComponent) {
        throw new InternalError(`Repository component for ${repository.name} not found`);
      }

      await playbooksRepositoryComponent.syncToDatabase();
      await this.updateRepositoryTree(repository);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error syncing repository ${repositoryUuid}: ${errorMessage}`);
      throw new InternalError(`Error syncing repository: ${errorMessage}`);
    }
  }

  /**
   * Delete a repository
   * @param repository The repository to delete
   */
  async deleteRepository(repository: PlaybooksRegisterDocument): Promise<void> {
    this.logger.log(`Deleting repository ${repository.name}`);

    try {
      // Deregister the repository from the engine
      await this.playbooksRegisterEngineService.deregisterRepository(repository.uuid);

      // Delete the repository from the database
      await this.playbooksRegisterModel.deleteOne({ uuid: repository.uuid });

      this.logger.log(`Repository ${repository.name} deleted successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error deleting repository: ${errorMessage}`);
      throw new InternalError(`Error deleting repository: ${errorMessage}`);
    }
  }

  /**
   * Update the repository tree
   * @param repository The repository to update
   */
  private async updateRepositoryTree(repository: PlaybooksRegisterDocument): Promise<void> {
    try {
      const playbooksRepositoryComponent =
        this.playbooksRegisterEngineService.getState()[repository.uuid];
      if (!playbooksRepositoryComponent) {
        throw new InternalError(`Repository component for ${repository.name} not found`);
      }

      const tree = await playbooksRepositoryComponent.updateDirectoriesTree();
      await this.playbooksRegisterModel.updateOne({ uuid: repository.uuid }, { $set: { tree } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating repository tree: ${errorMessage}`);
      throw new InternalError(`Error updating repository tree: ${errorMessage}`);
    }
  }
}
