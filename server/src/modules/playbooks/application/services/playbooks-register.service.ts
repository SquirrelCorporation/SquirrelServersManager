import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { FileSystemService } from '@modules/shell';
import { PlaybookFileService } from '@modules/shell';
import PlaybooksRegisterComponent from '@modules/playbooks/application/services/components/abstract-playbooks-register.component';
import { IPlaybooksRegister } from '@modules/playbooks/domain/entities/playbooks-register.entity';
import { IPlaybooksRegisterRepository, PLAYBOOKS_REGISTER_REPOSITORY } from '@modules/playbooks/domain/repositories/playbooks-register-repository.interface';
import { IPlaybookRepository, PLAYBOOK_REPOSITORY } from '@modules/playbooks/domain/repositories/playbook-repository.interface';
import { ForbiddenError, InternalError, NotFoundError } from '../../../../middlewares/api/ApiError';
import { recursiveTreeCompletion } from '../../utils/tree-utils';
import { PlaybooksRegisterEngineService } from './engine/playbooks-register-engine.service';

/**
 * Service for managing playbooks repositories
 */
@Injectable()
export class PlaybooksRegisterService implements OnModuleInit {
  private readonly logger = new Logger(PlaybooksRegisterService.name);

  constructor(
    @Inject(PLAYBOOKS_REGISTER_REPOSITORY)
    private readonly playbooksRegisterRepository: IPlaybooksRegisterRepository,
    @Inject(PLAYBOOK_REPOSITORY)
    private readonly playbookRepository: IPlaybookRepository,
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
      const registers = await this.playbooksRegisterRepository.findAllActive();
      for (const register of registers) {
        try {
          await this.playbooksRegisterEngineService.registerRegister(register);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to register repository ${register.name}: ${errorMessage}`);
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
  async getAllPlaybooksRepositories(): Promise<API.PlaybooksRepository[]> {
    try {
       const registers = await this.playbooksRegisterRepository.findAllActive();

      if (!registers) {
        return [];
      }

      const substitutedListOfPlaybooks = registers.map(
        async (register) => {
          this.logger.debug(`getAllPlaybooksRepositories - processing ${register.name}`);
          return {
            name: register.name,
            children: await recursiveTreeCompletion(register.tree),
            type: register.type,
            uuid: register.uuid,
            path: register.directory,
            default: register.default,
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
    register: IPlaybooksRegister,
    path: string,
  ): Promise<void> {
    const playbooksRegisterComponent = this.playbooksRegisterEngineService.getState()[
      register.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRegisterComponent) {
      throw new InternalError('Repository is not registered, try restarting or force sync');
    }

    if (!playbooksRegisterComponent.fileBelongToRepository(path)) {
      throw new ForbiddenError("The selected path doesn't seem to belong to the repository");
    }

    this.fileSystemService.createDirectory(path, playbooksRegisterComponent.rootPath);
    await playbooksRegisterComponent.updateDirectoriesTree();
  }

  /**
   * Create a playbook in a repository
   * @param repository The repository to create the playbook in
   * @param fullPath The path of the playbook
   * @param name The name of the playbook
   * @returns The created playbook
   */
  async createPlaybookInRepository(
    register: IPlaybooksRegister,
    fullPath: string,
    name: string,
  ): Promise<any> {
    const playbooksRegisterComponent = this.playbooksRegisterEngineService.getState()[
      register.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRegisterComponent) {
      throw new InternalError(`PlaybookRepository doesn't seem registered`);
    }

    if (!playbooksRegisterComponent.fileBelongToRepository(fullPath)) {
      throw new ForbiddenError("The selected path doesn't seem to belong to the repository");
    }

    const playbook = await this.playbookRepository.create({
      name: name,
      custom: true,
      path: fullPath + '.yml',
      playbooksRepository: register,
      playableInBatch: true,
    });

    this.playbookFileService.newPlaybook(fullPath + '.yml');
    await playbooksRegisterComponent.syncToDatabase();
    return playbook;
  }

  /**
   * Delete a playbook from a repository
   * @param repository The repository to delete the playbook from
   * @param playbookUuid The UUID of the playbook to delete
   */
  async deletePlaybookFromRepository(
    register: IPlaybooksRegister,
    playbookUuid: string,
  ): Promise<void> {
    const playbook = await this.playbookRepository.findOneByUuid(playbookUuid);
    if (!playbook) {
      throw new NotFoundError(`Playbook with UUID ${playbookUuid} not found`);
    }

    const playbooksRegisterComponent = this.playbooksRegisterEngineService.getState()[
      register.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRegisterComponent) {
      throw new InternalError(`PlaybookRepository doesn't seem registered`);
    }

    await this.playbookRepository.deleteByUuid(playbookUuid);
    this.playbookFileService.deletePlaybook(playbook.path);
    await playbooksRegisterComponent.syncToDatabase();
  }

  /**
   * Delete a directory from a repository
   * @param repository The repository to delete the directory from
   * @param path The path of the directory to delete
   */
  async deleteDirectoryFromRepository(
    register: IPlaybooksRegister,
    path: string,
  ): Promise<void> {
    const playbooksRegisterComponent = this.playbooksRegisterEngineService.getState()[
      register.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRegisterComponent) {
      throw new InternalError(`PlaybookRepository doesn't seem registered`);
    }

    if (!playbooksRegisterComponent.fileBelongToRepository(path)) {
      throw new ForbiddenError("The selected path doesn't seem to belong to the repository");
    }

    this.fileSystemService.deleteFiles(path, playbooksRegisterComponent.rootPath);
    await playbooksRegisterComponent.syncToDatabase();
  }

  /**
   * Save a playbook
   * @param playbookUuid The UUID of the playbook to save
   * @param content The content of the playbook
   */
  async savePlaybook(playbookUuid: string, content: string): Promise<void> {
    const playbook = await this.playbookRepository.findOneByUuid(playbookUuid);
    if (!playbook) {
      throw new NotFoundError(`Playbook with UUID ${playbookUuid} not found`);
    }

    this.fileSystemService.writeFile(content, playbook.path);
  }

  /**
   * Sync a repository
   * @param repositoryUuid The UUID of the repository to sync
   */
  async syncRepository(registerUuid: string): Promise<void> {
    try {
      const register = await this.playbooksRegisterRepository.findByUuid(registerUuid);
      if (!register) {
        throw new NotFoundError(`Repository with UUID ${registerUuid} not found`);
      }

      const playbooksRegisterComponent =
        this.playbooksRegisterEngineService.getState()[register.uuid];
      if (!playbooksRegisterComponent) {
        throw new InternalError(`Repository component for ${register.name} not found`);
      }

      await playbooksRegisterComponent.syncToDatabase();
      await this.updateRepositoryTree(register);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error syncing repository ${registerUuid}: ${errorMessage}`);
      throw new InternalError(`Error syncing repository: ${errorMessage}`);
    }
  }

  /**
   * Delete a repository
   * @param repository The repository to delete
   */
  async deleteRepository(register: IPlaybooksRegister): Promise<void> {
    this.logger.log(`Deleting repository ${register.name}`);

    try {
      // Deregister the repository from the engine
      await this.playbooksRegisterEngineService.deregisterRegister(register.uuid);

      // Delete the repository from the database
      await this.playbooksRegisterRepository.delete(register.uuid);

      this.logger.log(`Repository ${register.name} deleted successfully`);
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
  private async updateRepositoryTree(register: IPlaybooksRegister): Promise<void> {
    try {
      const playbooksRegisterComponent =
        this.playbooksRegisterEngineService.getState()[register.uuid];
      if (!playbooksRegisterComponent) {
        throw new InternalError(`Repository component for ${register.name} not found`);
      }

      const tree = await playbooksRegisterComponent.updateDirectoriesTree();
      register.tree = tree;
      await this.playbooksRegisterRepository.update(register.uuid, register);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating repository tree: ${errorMessage}`);
      throw new InternalError(`Error updating repository tree: ${errorMessage}`);
    }
  }
}
