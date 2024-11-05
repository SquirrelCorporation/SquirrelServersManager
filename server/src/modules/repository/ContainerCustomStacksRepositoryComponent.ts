import pino from 'pino';
import shell from 'shelljs';
import { RepositoryType } from 'ssm-shared-lib/distribution/enums/repositories';
import { SsmAlert } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { SSM_DATA_PATH } from '../../config';
import EventManager from '../../core/events/EventManager';
import Events from '../../core/events/events';
import ContainerCustomStack from '../../data/database/model/ContainerCustomStack';
import ContainerCustomStackRepository from '../../data/database/model/ContainerCustomStackRepository';
import ContainerCustomStackRepo from '../../data/database/repository/ContainerCustomStackRepo';
import ContainerStacksRepositoryRepo from '../../data/database/repository/ContainerCustomStackRepositoryRepo';
import { FileInfo, getMatchingFiles } from '../../helpers/files/recursive-find';
import logger from '../../logger';
import { NotFoundError } from '../../middlewares/api/ApiError';
import GitCustomStacksRepositoryUseCases from '../../services/GitCustomStacksRepositoryUseCases';
import Shell from '../shell';
import FileSystemManager from '../shell/managers/FileSystemManager';
import {
  GitStep,
  IGitUserInfos,
  IInitGitOptionsSyncImmediately,
  ILoggerContext,
  clone,
  commitAndSync,
  forcePull,
} from '../../helpers/git';

export const DIRECTORY_ROOT = `${SSM_DATA_PATH}/container-stacks`;

class ContainerCustomStacksRepositoryComponent extends EventManager {
  public name: string;
  public directory: string;
  public uuid: string;
  public childLogger: pino.Logger<never>;
  private readonly options: IInitGitOptionsSyncImmediately;

  constructor(
    uuid: string,
    name: string,
    branch: string,
    email: string,
    gitUserName: string,
    accessToken: string,
    remoteUrl: string,
  ) {
    super();
    const dir = `${DIRECTORY_ROOT}/${uuid}`;
    this.uuid = uuid;
    this.directory = dir;
    this.name = name;
    this.childLogger = logger.child(
      {
        module: `ContainerCustomStackRepository`,
        moduleId: `${this.uuid}`,
        moduleName: `${this.name}`,
      },
      { msgPrefix: `[CONTAINER_CUSTOM_STACK_GIT_REPOSITORY] - ` },
    );
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
  }

  public async delete() {
    Shell.FileSystemManager.deleteFiles(this.directory);
  }

  public async save(containerStackUuid: string, content: string) {
    const containerStack = await ContainerCustomStackRepo.findByUuid(containerStackUuid);
    if (!containerStack) {
      throw new NotFoundError(`Container Stack ${containerStackUuid} not found`);
    }
    shell.ShellString(content).to(containerStack.path as string);
  }

  public async syncToDatabase() {
    this.childLogger.info('saving to database...');
    const containerStackRepository = await this.getContainerStackRepository();
    const containerStacksListFromDatabase =
      await ContainerCustomStackRepo.listAllByRepository(containerStackRepository);
    this.childLogger.info(
      `Found ${containerStacksListFromDatabase?.length || 0} stacks from database`,
    );
    const containerStacksListFromDirectory = getMatchingFiles(
      this.directory,
      containerStackRepository.matchesList as string[],
    );
    this.childLogger.debug(containerStacksListFromDirectory);
    this.childLogger.info(
      `Found ${containerStacksListFromDirectory?.length || 0} stacks from directory`,
    );
    const containerStacksListToDelete = containerStacksListFromDatabase?.filter((stack) => {
      return !containerStacksListFromDirectory?.some((p) => p.fullPath === stack.path);
    });
    this.childLogger.info(
      `Found ${containerStacksListToDelete?.length || 0} stacks to delete from database`,
    );
    if (containerStacksListToDelete && containerStacksListToDelete.length > 0) {
      await Promise.all(
        containerStacksListToDelete?.map((stack) => {
          if (stack && stack.uuid) {
            return ContainerCustomStackRepo.deleteOne(stack.uuid);
          }
        }),
      );
    }
    const containerStackPathsToSync = containerStacksListFromDirectory?.filter((stack) => {
      return stack !== undefined;
    }) as FileInfo[];
    this.childLogger.info(`Stacks to sync : ${containerStackPathsToSync.length}`);
    await Promise.all(
      containerStackPathsToSync.map(async (stackPath) => {
        return this.updateOrCreateAssociatedStack(stackPath, containerStackRepository);
      }),
    );
    this.childLogger.info(`Updating Stacks Repository ${containerStackRepository.name}`);
  }

  private async getContainerStackRepository() {
    const containerStacksRepository = await ContainerStacksRepositoryRepo.findOneByUuid(this.uuid);
    if (!containerStacksRepository) {
      throw new NotFoundError(`Container Stacks repository ${this.uuid} not found`);
    }
    return containerStacksRepository;
  }

  private async updateOrCreateAssociatedStack(
    foundStack: FileInfo,
    containerCustomStackRepository: ContainerCustomStackRepository,
  ): Promise<void> {
    const stackFoundInDatabase = await ContainerCustomStackRepo.findOneByPath(
      foundStack.fullPath as string,
    );
    this.childLogger.debug(
      `Processing stack ${JSON.stringify(foundStack)} - In database: ${stackFoundInDatabase ? 'true' : 'false'}`,
    );
    const stackContent = FileSystemManager.readFile(foundStack.fullPath as string);
    const stackData: ContainerCustomStack = {
      path: foundStack.fullPath,
      name:
        stackFoundInDatabase?.name ||
        foundStack.fullPath.split(`${this.uuid}/`)[1].replaceAll('/', '_').toLowerCase(),
      containerCustomStackRepository: containerCustomStackRepository,
      uuid: stackFoundInDatabase?.uuid || uuidv4(),
      lockJson: true,
      type: RepositoryType.GIT,
      yaml: stackContent,
      icon: stackFoundInDatabase?.icon || 'file',
      iconBackgroundColor: stackFoundInDatabase?.iconBackgroundColor || '#000000',
      iconColor: stackFoundInDatabase?.iconColor || '#ffffff',
    };
    this.childLogger.debug(`Stack data: ${JSON.stringify(stackData)}`);
    await ContainerCustomStackRepo.updateOrCreate(stackData);
  }

  public fileBelongToRepository(path: string) {
    this.childLogger.info(
      `rootPath: ${this.directory?.split('/')[0]} versus ${path.split('/')[0]}`,
    );
    return this.directory?.split('/')[0] === path.split('/')[0];
  }

  getDirectory() {
    return this.directory;
  }

  async clone(syncAfter: boolean = false) {
    this.childLogger.info('Clone starting...');
    try {
      await GitCustomStacksRepositoryUseCases.resetRepositoryError(this.uuid);
      try {
        void Shell.FileSystemManager.createDirectory(this.directory, DIRECTORY_ROOT);
      } catch (error: any) {
        logger.warn(error);
      }
      await clone({
        ...this.options,
        logger: {
          debug: (message: string, context: ILoggerContext): unknown =>
            this.childLogger.debug(message, { callerFunction: 'clone', ...context }),
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
        await this.syncToDatabase();
      }
    } catch (error: any) {
      this.childLogger.error(error);
      await GitCustomStacksRepositoryUseCases.putRepositoryOnError(this.uuid, error);
      this.childLogger.info(`Emit ${Events.ALERT} with error: ${error.message}`);
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.ERROR,
        message: `Error during git clone: ${error.message}`,
        module: 'ContainerCustomStackRepository',
      });
    }
  }

  async commitAndSync() {
    try {
      await GitCustomStacksRepositoryUseCases.resetRepositoryError(this.uuid);
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
    } catch (error: any) {
      this.childLogger.error(error);
      await GitCustomStacksRepositoryUseCases.putRepositoryOnError(this.uuid, error);
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.ERROR,
        message: `Error during commit and sync: ${error.message}`,
        module: 'ContainerCustomStackRepository',
      });
    }
  }

  async forcePull() {
    try {
      await GitCustomStacksRepositoryUseCases.resetRepositoryError(this.uuid);
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
    } catch (error: any) {
      this.childLogger.error(error);
      await GitCustomStacksRepositoryUseCases.putRepositoryOnError(this.uuid, error);
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.ERROR,
        message: `Error during force pull: ${error.message}`,
        module: 'ContainerCustomStackRepository',
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

export interface AbstractComponent extends ContainerCustomStacksRepositoryComponent {
  save(playbookUuid: string, content: string): Promise<void>;
  init(): Promise<void>;
  delete(): Promise<void>;
  syncFromRepository(): Promise<void>;
}

export default ContainerCustomStacksRepositoryComponent;
