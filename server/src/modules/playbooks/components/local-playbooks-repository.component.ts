import * as path from 'path';
import * as fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { SsmAlert } from 'ssm-shared-lib';
import {
  ILocalPlaybooksRepositoryComponent,
  LocalComponentOptions,
} from '../interfaces/playbooks-repository-component.interface';
import { FileSystemService } from '../../shell';
import { PlaybooksRepositoryService } from '../services/playbooks-repository.service';
import { LocalPlaybooksRepositoryService } from '../services/local-playbooks-repository.service';
import { PlaybooksRepositoryRepository } from '../repositories/playbooks-repository.repository';
import Events from '../../../core/events/events';
import {
  Playbook,
  PlaybookDocument,
  PlaybookRepository,
  PlaybookRepositoryDocument,
  PlaybooksRepositoryComponent,
} from './playbooks-repository.component';

/**
 * Local implementation of the playbooks repository component
 */
@Injectable()
export class LocalPlaybooksRepositoryComponent
  extends PlaybooksRepositoryComponent
  implements ILocalPlaybooksRepositoryComponent
{
  private readonly logger = new Logger(LocalPlaybooksRepositoryComponent.name);

  constructor(
    protected readonly fileSystemService: FileSystemService,
    protected readonly playbooksRepositoryService: PlaybooksRepositoryService,
    protected readonly localPlaybooksRepositoryService: LocalPlaybooksRepositoryService,
    protected readonly playbooksRepositoryRepository: PlaybooksRepositoryRepository,
    protected readonly eventEmitter: EventEmitter2,
    @InjectModel(Playbook.name) protected readonly playbookModel: Model<PlaybookDocument>,
    @InjectModel(PlaybookRepository.name)
    protected readonly repositoryModel: Model<PlaybookRepositoryDocument>,
  ) {
    super(
      fileSystemService,
      playbooksRepositoryService,
      eventEmitter,
      playbookModel,
      repositoryModel,
    );
  }

  /**
   * Initialize the Local repository component with options
   * @param options Local component options
   */
  async initializeWithOptions(options: LocalComponentOptions): Promise<void> {
    const { uuid, name, directory } = options;
    await this.initialize(uuid, name, directory);
  }

  /**
   * Initialize the Local repository
   */
  async init(): Promise<void> {
    try {
      this.logger.log('Initializing local repository...');

      // Ensure the repository directory exists
      if (!fs.existsSync(this.rootPath)) {
        await this.fileSystemService.createDirectory(this.rootPath);
      }

      this.logger.log('Local repository initialized');

      // Emit repository initialized event
      this.emit('repository.initialized', { uuid: this.uuid });
    } catch (error: any) {
      this.logger.error(
        `Error initializing local repository: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: 'Error initializing local repository',
        message: `Error initializing local repository: ${error?.message || 'Unknown error'}`,
      });

      throw error;
    }
  }

  /**
   * Sync from the Local repository (no-op for local repositories)
   */
  async syncFromRepository(): Promise<void> {
    try {
      this.logger.log('Syncing from local repository...');

      // For local repositories, we just sync to database
      await this.syncToDatabase();

      this.logger.log('Synced from local repository');

      // Emit repository synced event
      this.emit('repository.synced', { uuid: this.uuid });
    } catch (error: any) {
      this.logger.error(
        `Error syncing from local repository: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: 'Error syncing from local repository',
        message: `Error syncing from local repository: ${error?.message || 'Unknown error'}`,
      });

      throw error;
    }
  }

  /**
   * Create a directory in the repository
   * @param dirPath Path of the directory to create
   */
  async createDirectory(dirPath: string): Promise<void> {
    try {
      this.logger.log(`Creating directory ${dirPath}...`);

      const fullPath = path.join(this.rootPath, dirPath);
      await this.fileSystemService.createDirectory(fullPath);

      this.logger.log(`Directory ${dirPath} created`);

      // Update the directories tree
      await this.updateDirectoriesTree();

      // Emit directory created event
      this.emit('directory.created', { uuid: this.uuid, path: dirPath });
    } catch (error: any) {
      this.logger.error(
        `Error creating directory ${dirPath}: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: 'Error creating directory',
        message: `Error creating directory ${dirPath}: ${error?.message || 'Unknown error'}`,
      });

      throw error;
    }
  }

  /**
   * Create a playbook in the repository
   * @param fullPath Path of the playbook to create
   * @param name Name of the playbook
   */
  async createPlaybook(fullPath: string, name: string): Promise<any> {
    try {
      this.logger.log(`Creating playbook ${name} at ${fullPath}...`);

      // Find the repository
      const repository = await this.playbooksRepositoryRepository.findByUuidOrFail(this.uuid);

      // Create the playbook file
      const playbookPath = path.join(this.rootPath, fullPath);
      await this.fileSystemService.writeFile('', playbookPath);

      // Create the playbook in the database
      const playbook = await this.playbooksRepositoryService.createPlaybookInRepository(
        repository,
        fullPath,
        name,
      );

      this.logger.log(`Playbook ${name} created at ${fullPath}`);

      // Update the directories tree
      await this.updateDirectoriesTree();

      // Emit playbook created event
      this.emit('playbook.created', { uuid: this.uuid, path: fullPath, name });

      return playbook;
    } catch (error: any) {
      this.logger.error(
        `Error creating playbook ${name} at ${fullPath}: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: 'Error creating playbook',
        message: `Error creating playbook ${name} at ${fullPath}: ${error?.message || 'Unknown error'}`,
      });

      throw error;
    }
  }

  /**
   * Delete a playbook from the repository
   * @param playbookUuid UUID of the playbook to delete
   */
  async deletePlaybook(playbookUuid: string): Promise<void> {
    try {
      this.logger.log(`Deleting playbook ${playbookUuid}...`);

      // Find the repository
      const repository = await this.playbooksRepositoryRepository.findByUuidOrFail(this.uuid);

      // Delete the playbook
      await this.playbooksRepositoryService.deletePlaybookFromRepository(repository, playbookUuid);

      this.logger.log(`Playbook ${playbookUuid} deleted`);

      // Update the directories tree
      await this.updateDirectoriesTree();

      // Emit playbook deleted event
      this.emit('playbook.deleted', { uuid: playbookUuid, repositoryUuid: this.uuid });
    } catch (error: any) {
      this.logger.error(
        `Error deleting playbook ${playbookUuid}: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: 'Error deleting playbook',
        message: `Error deleting playbook ${playbookUuid}: ${error?.message || 'Unknown error'}`,
      });

      throw error;
    }
  }

  /**
   * Delete a directory from the repository
   * @param dirPath Path of the directory to delete
   */
  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      this.logger.log(`Deleting directory ${dirPath}...`);

      // Find the repository
      const repository = await this.playbooksRepositoryRepository.findByUuidOrFail(this.uuid);

      // Delete the directory
      await this.playbooksRepositoryService.deleteDirectoryFromRepository(repository, dirPath);

      this.logger.log(`Directory ${dirPath} deleted`);

      // Update the directories tree
      await this.updateDirectoriesTree();

      // Emit directory deleted event
      this.emit('directory.deleted', { uuid: this.uuid, path: dirPath });
    } catch (error: any) {
      this.logger.error(
        `Error deleting directory ${dirPath}: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: 'Error deleting directory',
        message: `Error deleting directory ${dirPath}: ${error?.message || 'Unknown error'}`,
      });

      throw error;
    }
  }
}
