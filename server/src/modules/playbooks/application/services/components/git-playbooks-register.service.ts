import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPlaybooksRegisterRepository } from '@modules/playbooks/domain/repositories/playbooks-register-repository.interface';
import PlaybooksRegisterComponent from '@modules/playbooks/application/services/components/abstract-playbooks-register-component';
import { PlaybooksRegisterEngineService } from '@modules/playbooks/application/services/engine/playbooks-register-engine.service';
import { GitStep, IGitUserInfos, IInitGitOptionsSyncImmediately, ILoggerContext, clone, commitAndSync, forcePull } from 'src/helpers/git';
import Events from 'src/core/events/events';
import { SsmAlert, SsmGit } from 'ssm-shared-lib';
import { InternalError, NotFoundError } from '../../../../../middlewares/api/ApiError';
import {
  PlaybooksRegister,
} from '../../../infrastructure/schemas/playbooks-register.schema';

/**
 * Service for managing Git playbooks repositories
 */
@Injectable()
export class GitPlaybooksRegisterService extends PlaybooksRegisterComponent {
  private readonly logger = new Logger(GitPlaybooksRegisterService.name);
  private readonly options: IInitGitOptionsSyncImmediately;

constructor(
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
    super(uuid, name, DIRECTORY_ROOT);
    this.uuid = uuid;
    this.name = name;
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
    this.options = {
      dir: this.directory,
      syncImmediately: true,
      userInfo: userInfo,
      remoteUrl: remoteUrl,
    };

    this.childLogger = logger.child(
      { module: `PlaybooksGitRepository`, moduleId: `${this.uuid}`, moduleName: `${this.name}` },
      { msgPrefix: `[PLAYBOOKS_GIT_REPOSITORY] - ` },
    );
  }



 async init() {
    await this.clone();
  }

  async syncFromRepository() {
    await this.forcePull();
  }
  /**
   * Force pull a Git repository
   * @param uuid Repository UUID
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
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.SUCCESS,
        message: `Successfully forcepull repository ${this.name}`,
        module: 'GitPlaybooksRepositoryComponent',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error force pulling Git repository: ${errorMessage}`);
      throw new InternalError(`Error force pulling Git repository: ${errorMessage}`);
    }
  }

  /**
   * Clone a Git repository
   */
  async clone(syncAfter = false): Promise<void> {
    try {
 try {
        void Shell.FileSystemManager.createDirectory(this.directory, DIRECTORY_ROOT);
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
        this.emit(Events.ALERT, {
          severity: SsmAlert.AlertType.SUCCESS,
          message: `Successfully updated repository ${this.name} with ${nbSync} files`,
          module: 'GitPlaybooksRepositoryComponent',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error cloning Git repository: ${errorMessage}`);
      throw new InternalError(`Error cloning Git repository: ${errorMessage}`);
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
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.SUCCESS,
        message: `Successfully commit and sync repository ${this.name}`,
        module: 'GitPlaybooksRepositoryComponent',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error committing and syncing Git repository: ${errorMessage}`);
      throw new InternalError(`Error committing and syncing Git repository: ${errorMessage}`);
    }
  }
}
