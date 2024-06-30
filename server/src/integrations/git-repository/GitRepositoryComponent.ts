import PlaybooksRepositoryComponent, {
  AbstractComponent,
  DIRECTORY_ROOT,
  FILE_PATTERN,
} from '../playbooks-repository/PlaybooksRepositoryComponent';
import { createDirectoryWithFullPath, findFilesInDirectory } from '../shell/utils';
import {
  GitStep,
  IGitUserInfos,
  IInitGitOptionsSyncImmediately,
  ILoggerContext,
  clone,
  commitAndSync,
  forcePull,
} from './lib';

class GitRepositoryComponent extends PlaybooksRepositoryComponent implements AbstractComponent {
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
  ) {
    super(uuid, name, DIRECTORY_ROOT);
    this.uuid = uuid;
    this.name = name;
    const userInfo: IGitUserInfos = {
      email: email,
      gitUserName: gitUserName,
      branch: branch,
      accessToken: accessToken,
    };
    this.options = {
      dir: this.directory,
      syncImmediately: true,
      userInfo: userInfo,
      remoteUrl: remoteUrl,
    };

    this.childLogger = logger.child(
      { module: `git-repository/${this.name}/${branch}` },
      { msgPrefix: `[GIT_REPOSITORY] - ` },
    );
  }

  async clone() {
    this.childLogger.info('Clone starting...');
    try {
      void createDirectoryWithFullPath(this.directory);
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
    } catch (error) {
      this.childLogger.error(error);
    }
  }

  async commitAndSync() {
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
    } catch (error) {
      this.childLogger.error(error);
    }
  }

  async forcePull() {
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
    } catch (error) {
      this.childLogger.error(error);
    }
  }

  async init() {
    await this.clone();
  }

  async syncFromRepository() {
    await this.forcePull();
  }
}

export default GitRepositoryComponent;
