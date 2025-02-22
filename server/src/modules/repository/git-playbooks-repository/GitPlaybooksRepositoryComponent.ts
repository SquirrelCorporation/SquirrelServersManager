import { SsmAlert, SsmGit } from 'ssm-shared-lib';
import Events from '../../../core/events/events';
import {
  GitStep,
  IGitUserInfos,
  IInitGitOptionsSyncImmediately,
  ILoggerContext,
  clone,
  commitAndSync,
  forcePull,
} from '../../../helpers/git';
import GitPlaybooksRepositoryUseCases from '../../../services/GitPlaybooksRepositoryUseCases';
import Shell from '../../shell';
import PlaybooksRepositoryComponent, {
  AbstractComponent,
  DIRECTORY_ROOT,
} from '../PlaybooksRepositoryComponent';

class GitPlaybooksRepositoryComponent
  extends PlaybooksRepositoryComponent
  implements AbstractComponent
{
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

  async clone(syncAfter = false) {
    this.childLogger.info('Clone starting...');
    try {
      await GitPlaybooksRepositoryUseCases.resetRepositoryError(this.uuid);
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
    } catch (error: any) {
      this.childLogger.error(error);
      await GitPlaybooksRepositoryUseCases.putRepositoryOnError(this.uuid, error);
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.ERROR,
        message: `Error during clone: ${error.message}`,
        module: 'GitPlaybooksRepositoryComponent',
      });
    }
  }

  async commitAndSync() {
    try {
      await GitPlaybooksRepositoryUseCases.resetRepositoryError(this.uuid);
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
    } catch (error: any) {
      this.childLogger.error(error);
      await GitPlaybooksRepositoryUseCases.putRepositoryOnError(this.uuid, error);
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.ERROR,
        message: `Error during commit and sync: ${error.message}`,
        module: 'GitPlaybooksRepositoryComponent',
      });
    }
  }

  async forcePull() {
    try {
      await GitPlaybooksRepositoryUseCases.resetRepositoryError(this.uuid);
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
    } catch (error: any) {
      this.childLogger.error(error);
      await GitPlaybooksRepositoryUseCases.putRepositoryOnError(this.uuid, error);
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.ERROR,
        message: `Error during forcePull: ${error.message}`,
        module: 'GitPlaybooksRepositoryComponent',
      });
    }
  }

  async init() {
    await this.clone();
  }

  async syncFromRepository() {
    await this.forcePull();
  }
}

export default GitPlaybooksRepositoryComponent;
