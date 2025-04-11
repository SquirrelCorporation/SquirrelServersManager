import {
  GitStep,
  IGitUserInfos,
  ILoggerContext,
} from '@infrastructure/adapters/git/interfaces/git.interface';
import { clone } from '@infrastructure/adapters/git/services/clone.service';
import { commitAndSync } from '@infrastructure/adapters/git/services/commit-and-sync.service';
import { forcePull } from '@infrastructure/adapters/git/services/force-pull.service';
import { IInitGitOptionsSyncImmediately } from '@infrastructure/adapters/git/services/init-git.service';
import { InternalServerException } from '@infrastructure/exceptions/app-exceptions';
import {
  IPlaybookRepository,
  IPlaybooksRegisterRepository,
  ITreeNodeService,
} from '@modules/playbooks';
import PlaybooksRegisterComponent, {
  DIRECTORY_ROOT,
} from '@modules/playbooks/application/services/components/abstract-playbooks-register.component';
import { IFileSystemService, IPlaybookFileService } from '@modules/shell';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SsmAlert, SsmGit } from 'ssm-shared-lib';
import Events from '../../../../../core/events/events';

/**
 * Service for managing Git playbooks repositories
 */
@Injectable()
export class GitPlaybooksRegisterComponent extends PlaybooksRegisterComponent {
  private readonly logger = new Logger(GitPlaybooksRegisterComponent.name);
  private readonly options: IInitGitOptionsSyncImmediately;

  constructor(
    fileSystemService: IFileSystemService,
    playbookFileService: IPlaybookFileService,
    playbookRepository: IPlaybookRepository,
    playbooksRegisterRepository: IPlaybooksRegisterRepository,
    private readonly eventEmitter: EventEmitter2,
    treeNodeService: ITreeNodeService,
    uuid: string,
    logger: any,
    name: string,
    branch: string,
    email: string,
    gitUserName: string,
    accessToken: string,
    remoteUrl: string,
    gitService: SsmGit.Services,
    ignoreSSLErrors: boolean,
  ) {
    super(
      fileSystemService,
      playbookFileService,
      playbookRepository,
      playbooksRegisterRepository,
      treeNodeService,
      uuid,
      name,
      DIRECTORY_ROOT,
    );

    // Configure user information
    const userInfo: IGitUserInfos = {
      email: email,
      gitUserName: gitUserName,
      branch: branch,
      accessToken: accessToken,
      gitService: gitService,
      env: ignoreSSLErrors
        ? {
            GIT_SSL_NO_VERIFY: 'true',
          }
        : undefined,
    };

    // Set git options
    this.options = {
      dir: this.directory,
      syncImmediately: true,
      userInfo: userInfo,
      remoteUrl: remoteUrl,
    };

    // Configure logger
    this.childLogger = logger;
  }

  /**
   * Initialize the component by cloning the git repository
   */
  async init(): Promise<void> {
    await this.clone();
  }

  /**
   * Sync from remote repository
   */
  async syncFromRepository(): Promise<void> {
    await this.forcePull();
  }

  /**
   * Force pull a Git repository
   */
  async forcePull(): Promise<void> {
    try {
      await forcePull({
        ...this.options,
        logger: {
          debug: (message: string, context: ILoggerContext): unknown =>
            this.childLogger.debug(message, { callerFunction: 'forcePull', ...context }),
          warn: (message: string, context: ILoggerContext): unknown =>
            this.childLogger.warn(message, { callerFunction: 'forcePull', ...context }),
          info: (message: GitStep, context: ILoggerContext): void => {
            this.childLogger.info(message, {
              callerFunction: 'forcePull',
              ...context,
            });
          },
        },
      });

      this.eventEmitter.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.SUCCESS,
        message: `Successfully forcepull repository ${this.name}`,
        module: 'GitPlaybooksRepositoryComponent',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error force pulling Git repository: ${errorMessage}`);
      throw new InternalServerException(`Error force pulling Git repository: ${errorMessage}`);
    }
  }

  /**
   * Clone a Git repository
   */
  async clone(syncAfter = false): Promise<void> {
    try {
      // Create directory if needed
      try {
        await this.fileSystemService.createDirectory(this.directory, DIRECTORY_ROOT);
      } catch (error: any) {
        this.childLogger.warn(error);
      }

      await clone({
        ...this.options,
        logger: {
          debug: (message: string, context: ILoggerContext): unknown =>
            this.childLogger.info(message, { callerFunction: 'clone', ...context }),
          warn: (message: string, context: ILoggerContext): unknown =>
            this.childLogger.warn(message, { callerFunction: 'clone', ...context }),
          info: (message: GitStep, context: ILoggerContext): void => {
            this.childLogger.info(message, {
              callerFunction: 'clone',
              ...context,
            });
          },
        },
      });

      if (syncAfter) {
        const nbSync = await this.syncToDatabase();

        this.eventEmitter.emit(Events.ALERT, {
          severity: SsmAlert.AlertType.SUCCESS,
          message: `Successfully updated repository ${this.name} with ${nbSync} files`,
          module: 'GitPlaybooksRepositoryComponent',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error cloning Git repository: ${errorMessage}`);
      throw new InternalServerException(`Error cloning Git repository: ${errorMessage}`);
    }
  }

  /**
   * Commit and sync a Git repository
   */
  async commitAndSync(): Promise<void> {
    try {
      await commitAndSync({
        ...this.options,
        logger: {
          debug: (message: string, context: ILoggerContext): unknown =>
            this.childLogger.debug(message, { callerFunction: 'commitAndSync', ...context }),
          warn: (message: string, context: ILoggerContext): unknown =>
            this.childLogger.warn(message, { callerFunction: 'commitAndSync', ...context }),
          info: (message: GitStep, context: ILoggerContext): void => {
            this.childLogger.info(message, {
              callerFunction: 'commitAndSync',
              ...context,
            });
          },
        },
      });

      this.eventEmitter.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.SUCCESS,
        message: `Successfully commit and sync repository ${this.name}`,
        module: 'GitPlaybooksRepositoryComponent',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error committing and syncing Git repository: ${errorMessage}`);
      throw new InternalServerException(
        `Error committing and syncing Git repository: ${errorMessage}`,
      );
    }
  }
}
