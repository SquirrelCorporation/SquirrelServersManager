import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { SsmAlert, SsmGit } from 'ssm-shared-lib';
import {
  GitComponentOptions,
  IGitPlaybooksRepositoryComponent,
} from '../interfaces/playbooks-repository-component.interface';
import { FileSystemService } from '../../shell';
import { PlaybooksRepositoryService } from '../services/playbooks-repository.service';
import { GitPlaybooksRepositoryService } from '../services/git-playbooks-repository.service';
import { PlaybooksRepositoryRepository } from '../repositories/playbooks-repository.repository';
import {
  IGitUserInfos,
  IInitGitOptionsSyncImmediately,
  ILoggerContext,
  clone,
  commitAndSync,
  forcePull,
} from '../../../helpers/git';
import Events from '../../../core/events/events';
import {
  Playbook,
  PlaybookDocument,
  PlaybookRepository,
  PlaybookRepositoryDocument,
  PlaybooksRepositoryComponent,
} from './playbooks-repository.component';

/**
 * Git implementation of the playbooks repository component
 */
@Injectable()
export class GitPlaybooksRepositoryComponent
  extends PlaybooksRepositoryComponent
  implements IGitPlaybooksRepositoryComponent
{
  private branch: string = '';
  private email: string = '';
  private gitUserName: string = '';
  private accessToken: string = '';
  private remoteUrl: string = '';
  private gitService: string = '';
  private ignoreSSLErrors: boolean = false;
  private options: IInitGitOptionsSyncImmediately | null = null;
  private readonly logger = new Logger(GitPlaybooksRepositoryComponent.name);

  constructor(
    protected readonly fileSystemService: FileSystemService,
    protected readonly playbooksRepositoryService: PlaybooksRepositoryService,
    protected readonly gitPlaybooksRepositoryService: GitPlaybooksRepositoryService,
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
   * Initialize the Git repository component with options
   * @param options Git component options
   */
  async initializeWithOptions(options: GitComponentOptions): Promise<void> {
    const {
      uuid,
      name,
      branch,
      email,
      gitUserName,
      accessToken,
      remoteUrl,
      gitService,
      ignoreSSLErrors,
    } = options;

    await this.initialize(uuid, name, uuid);

    this.branch = branch;
    this.email = email;
    this.gitUserName = gitUserName;
    this.accessToken = accessToken;
    this.remoteUrl = remoteUrl;
    this.gitService = gitService;
    this.ignoreSSLErrors = ignoreSSLErrors;

    // Set up Git options
    const userInfo: IGitUserInfos = {
      email: this.email,
      gitUserName: this.gitUserName,
      branch: this.branch,
      accessToken: this.accessToken,
      gitService: this.gitService as SsmGit.Services,
      env: this.ignoreSSLErrors
        ? {
            GIT_SSL_NO_VERIFY: 'true',
          }
        : undefined,
    };

    this.options = {
      dir: this.rootPath,
      remoteUrl: this.remoteUrl,
      syncImmediately: true,
      userInfo,
      logger: {
        debug: (message: string, context?: ILoggerContext) => {
          this.logger.debug(`${message}`);
        },
        info: (message: string, context?: ILoggerContext) => {
          this.logger.log(`${message}`);
        },
        warn: (message: string, context?: ILoggerContext) => {
          this.logger.warn(`${message}`);
        },
      },
    };
  }

  /**
   * Initialize the Git repository
   */
  async init(): Promise<void> {
    try {
      this.logger.log('Initializing git repository...');

      if (!this.options) {
        throw new Error('Git options not initialized');
      }

      // Use the clone function from git helpers
      await clone(this.options);

      this.logger.log('Git repository initialized');

      // Emit repository initialized event
      this.emit('repository.initialized', { uuid: this.uuid });
    } catch (error: any) {
      this.logger.error(`Error initializing git repository: ${error?.message || 'Unknown error'}`);

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: 'Error initializing git repository',
        message: `Error initializing git repository: ${error?.message || 'Unknown error'}`,
      });

      throw error;
    }
  }

  /**
   * Sync from the Git repository
   */
  async syncFromRepository(): Promise<void> {
    try {
      this.logger.log('Syncing from remote repository...');

      if (!this.options) {
        throw new Error('Git options not initialized');
      }

      // Use the forcePull function from git helpers
      await forcePull(this.options);

      this.logger.log('Synced from remote repository');

      // Sync to database
      await this.syncToDatabase();

      // Emit repository synced event
      this.emit('repository.synced', { uuid: this.uuid });
    } catch (error: any) {
      this.logger.error(
        `Error syncing from remote repository: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: 'Error syncing from remote repository',
        message: `Error syncing from remote repository: ${error?.message || 'Unknown error'}`,
      });

      throw error;
    }
  }

  /**
   * Commit changes and sync with remote
   */
  async commitAndSync(): Promise<void> {
    try {
      this.logger.log('Committing and syncing to remote repository...');

      if (!this.options) {
        throw new Error('Git options not initialized');
      }

      // Use the commitAndSync function from git helpers
      await commitAndSync(this.options);

      this.logger.log('Committed and synced to remote repository');

      // Emit repository committed event
      this.emit('repository.committed', { uuid: this.uuid });
    } catch (error: any) {
      this.logger.error(
        `Error committing and syncing to remote repository: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: 'Error committing and syncing to remote repository',
        message: `Error committing and syncing to remote repository: ${error?.message || 'Unknown error'}`,
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

      // Commit the new directory
      await this.commitAndSync();

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
        title: `Error creating directory ${dirPath}`,
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

      // Create the playbook using the service
      const playbook = await this.playbooksRepositoryService.createPlaybookInRepository(
        repository,
        fullPath,
        name,
      );

      this.logger.log(`Playbook ${name} created at ${fullPath}`);

      // Commit the new playbook
      await this.commitAndSync();

      // Emit playbook created event
      this.emit('playbook.created', { uuid: this.uuid, path: fullPath, name });

      // Return the playbook data
      return playbook;
    } catch (error: any) {
      this.logger.error(
        `Error creating playbook ${name} at ${fullPath}: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: `Error creating playbook ${name}`,
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

      // Delete the playbook using the service
      await this.playbooksRepositoryService.deletePlaybookFromRepository(repository, playbookUuid);

      this.logger.log(`Playbook ${playbookUuid} deleted`);

      // Commit the deletion
      await this.commitAndSync();

      // Emit playbook deleted event
      this.emit('playbook.deleted', { uuid: playbookUuid, repositoryUuid: this.uuid });
    } catch (error: any) {
      this.logger.error(
        `Error deleting playbook ${playbookUuid}: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: `Error deleting playbook ${playbookUuid}`,
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

      // Delete the directory using the service
      await this.playbooksRepositoryService.deleteDirectoryFromRepository(repository, dirPath);

      this.logger.log(`Directory ${dirPath} deleted`);

      // Commit the deletion
      await this.commitAndSync();

      // Emit directory deleted event
      this.emit('directory.deleted', { uuid: this.uuid, path: dirPath });
    } catch (error: any) {
      this.logger.error(
        `Error deleting directory ${dirPath}: ${error?.message || 'Unknown error'}`,
      );

      // Emit alert event
      this.emit(Events.ALERT, {
        type: SsmAlert.AlertType.ERROR,
        title: `Error deleting directory ${dirPath}`,
        message: `Error deleting directory ${dirPath}: ${error?.message || 'Unknown error'}`,
      });

      throw error;
    }
  }
}
