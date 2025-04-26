import {
  EntityNotFoundException,
  ForbiddenException,
  InternalServerException,
} from '@infrastructure/exceptions/app-exceptions';
import PlaybooksRegisterComponent from '@modules/playbooks/application/services/components/abstract-playbooks-register.component';
import { IPlaybooksRegister } from '@modules/playbooks/domain/entities/playbooks-register.entity';
import {
  IPlaybookRepository,
  PLAYBOOK_REPOSITORY,
} from '@modules/playbooks/domain/repositories/playbook-repository.interface';
import {
  IPlaybooksRegisterRepository,
  PLAYBOOKS_REGISTER_REPOSITORY,
} from '@modules/playbooks/domain/repositories/playbooks-register-repository.interface';
import { FileSystemService, PlaybookFileService } from '@modules/shell';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { PLAYBOOKS_REGISTER_ENGINE_SERVICE } from '@modules/playbooks';
import Events from 'src/core/events/events';
import { OnEvent } from '@nestjs/event-emitter';
import { IPlaybooksRegisterService } from '../../domain/services/playbooks-register-service.interface';
import { PlaybooksRegisterEngineService } from './engine/playbooks-register-engine.service';
import { TreeNodeService } from './tree-node.service';

/**
 * Service for managing playbooks repositories
 */
@Injectable()
export class PlaybooksRegisterService implements IPlaybooksRegisterService {
  private readonly logger = new Logger(PlaybooksRegisterService.name);

  constructor(
    @Inject(PLAYBOOKS_REGISTER_REPOSITORY)
    private readonly playbooksRegisterRepository: IPlaybooksRegisterRepository,
    @Inject(PLAYBOOK_REPOSITORY)
    private readonly playbookRepository: IPlaybookRepository,
    @Inject(PLAYBOOKS_REGISTER_ENGINE_SERVICE)
    private readonly playbooksRegisterEngineService: PlaybooksRegisterEngineService,
    private readonly fileSystemService: FileSystemService,
    private readonly playbookFileService: PlaybookFileService,
    private readonly treeNodeService: TreeNodeService,
  ) {}

  /**
   * Initialize the service
   */
  @OnEvent(Events.REGISTER_PLAYBOOK_REGISTERS)
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
      void this.playbooksRegisterEngineService.syncAllRegisters();
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
      this.logger.debug(`getAllPlaybooksRepositories - found ${registers.length} registers`);
      this.logger.debug(`getAllPlaybooksRepositories - registers: ${JSON.stringify(registers)}`);
      if (!registers) {
        return [];
      }

      const substitutedListOfPlaybooks = registers.map(async (register) => {
        this.logger.debug(`getAllPlaybooksRepositories - processing ${register.name}`);
        return {
          name: register.name,
          children: await this.treeNodeService.recursiveTreeCompletion(register.tree),
          type: register.type,
          uuid: register.uuid,
          path: register.directory,
          default: register.default,
        };
      });

      return (await Promise.all(substitutedListOfPlaybooks)).sort((a, b) =>
        b.default ? 1 : a.default ? 1 : a.name.localeCompare(b.name),
      ) as API.PlaybooksRepository[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting all playbooks repositories: ${errorMessage}`);
      throw new InternalServerException(
        `Error getting all playbooks repositories: ${errorMessage}`,
      );
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
      throw new InternalServerException(
        'Repository is not registered, try restarting or force sync',
      );
    }

    if (!playbooksRegisterComponent.fileBelongToRepository(path)) {
      throw new ForbiddenException("The selected path doesn't seem to belong to the repository");
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
      throw new InternalServerException(`PlaybookRepository doesn't seem registered`);
    }

    if (!playbooksRegisterComponent.fileBelongToRepository(fullPath)) {
      throw new ForbiddenException("The selected path doesn't seem to belong to the repository");
    }

    // First find the actual MongoDB document for the register
    const registerDoc = await this.playbooksRegisterRepository.findByUuid(register.uuid);
    if (!registerDoc) {
      throw new InternalServerException(`PlaybookRepository document not found`);
    }

    // Create the playbook with the register document as the repository reference
    const playbook = await this.playbookRepository.create({
      name: name,
      custom: true,
      path: fullPath + '.yml',
      playbooksRepository: registerDoc, // Use the entire register document
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
      throw new EntityNotFoundException('Playbook', playbookUuid);
    }

    const playbooksRegisterComponent = this.playbooksRegisterEngineService.getState()[
      register.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRegisterComponent) {
      throw new InternalServerException(`PlaybookRepository doesn't seem registered`);
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
  async deleteDirectoryFromRepository(register: IPlaybooksRegister, path: string): Promise<void> {
    const playbooksRegisterComponent = this.playbooksRegisterEngineService.getState()[
      register.uuid
    ] as PlaybooksRegisterComponent;

    if (!playbooksRegisterComponent) {
      throw new InternalServerException(`PlaybookRepository doesn't seem registered`);
    }

    if (!playbooksRegisterComponent.fileBelongToRepository(path)) {
      throw new ForbiddenException("The selected path doesn't seem to belong to the repository");
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
      throw new EntityNotFoundException('Playbook', playbookUuid);
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
        throw new EntityNotFoundException('Repository', registerUuid);
      }

      const playbooksRegisterComponent =
        this.playbooksRegisterEngineService.getState()[register.uuid];
      if (!playbooksRegisterComponent) {
        throw new InternalServerException(`Repository component for ${register.name} not found`);
      }

      await playbooksRegisterComponent.syncToDatabase();
      await this.updateRepositoryTree(register);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error syncing repository ${registerUuid}: ${errorMessage}`);
      throw new InternalServerException(`Error syncing repository: ${errorMessage}`);
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
      throw new InternalServerException(`Error deleting repository: ${errorMessage}`);
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
        throw new InternalServerException(`Repository component for ${register.name} not found`);
      }

      const tree = await playbooksRegisterComponent.updateDirectoriesTree();
      register.tree = tree;
      await this.playbooksRegisterRepository.update(register.uuid, register);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating repository tree: ${errorMessage}`);
      throw new InternalServerException(`Error updating repository tree: ${errorMessage}`);
    }
  }
}
