import { Inject, Injectable } from '@nestjs/common';
import pino from 'pino';
import { SsmAlert, SsmGit } from 'ssm-shared-lib';
import { RepositoryType } from 'ssm-shared-lib/distribution/enums/repositories';
import { v4 as uuidv4 } from 'uuid';
import { SSM_DATA_PATH } from '../../../../config';
import EventManager from '../../../../core/events/EventManager';
import Events from '../../../../core/events/events';
import { FileInfo, getMatchingFiles } from '../../../../helpers/files/recursive-find';
import { extractTopLevelName } from '../../../../helpers/docker/utils';
import {
  GitStep,
  IGitUserInfos,
  IInitGitOptionsSyncImmediately,
  ILoggerContext,
  clone,
  commitAndSync,
  forcePull,
} from '../../../../helpers/git';
import logger from '../../../../logger';
import { NotFoundError } from '../../../../middlewares/api/ApiError';
import { ShellWrapperService } from '../../../shell';
import { ContainerCustomStacksRepositoryRepository } from '../../infrastructure/repositories/container-custom-stacks-repository.repository';
import { ContainerCustomStackRepository } from '../../infrastructure/repositories/container-custom-stack.repository';
import { RepositoryConfig } from '../../domain/entities/repository-config.entity';
import { IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';
import { CONTAINER_STACKS_SERVICE } from '../interfaces/container-stacks-service.interface';
import { ContainerStacksService } from './container-stacks.service';

export const DIRECTORY_ROOT = `${SSM_DATA_PATH}/container-stacks`;


@Injectable()
export class ContainerRepositoryComponentService extends EventManager {
  public name = '';
  public directory = '';
  public uuid = '';
  public childLogger!: pino.Logger<never>;

  private branch = '';
  private email = '';
  private userName = '';
  private accessToken = '';
  private remoteUrl = '';
  private gitService!: SsmGit.Services;
  private ignoreSSLErrors = false;
  private options!: IInitGitOptionsSyncImmediately;

  private initialized = false;

  constructor(
    private readonly shellWrapperService: ShellWrapperService,
    private readonly containerCustomStackRepository: ContainerCustomStackRepository,
    private readonly containerCustomStacksRepositoryRepository: ContainerCustomStacksRepositoryRepository,
    @Inject(CONTAINER_STACKS_SERVICE) private readonly containerStacksService: ContainerStacksService,
  ) {
    super();
  }

  initialize(config: RepositoryConfig): void {
    const dir = `${DIRECTORY_ROOT}/${config.uuid}`;
    this.uuid = config.uuid;
    this.directory = dir;
    this.name = config.name;
    this.branch = config.branch;
    this.email = config.email;
    this.userName = config.userName;
    this.accessToken = config.accessToken;
    this.remoteUrl = config.remoteUrl;
    this.gitService = config.gitService;
    this.ignoreSSLErrors = config.ignoreSSLErrors || false;

    this.childLogger = logger.child(
      {
        module: `ContainerCustomStackRepository`,
        moduleId: `${this.uuid}`,
        moduleName: `${this.name}`,
      },
      { msgPrefix: `[CONTAINER_CUSTOM_STACK_GIT_REPOSITORY] - ` },
    );

    const userInfo: IGitUserInfos = {
      email: this.email,
      gitUserName: this.userName,
      branch: this.branch,
      accessToken: this.accessToken,
      gitService: this.gitService,
      env: this.ignoreSSLErrors
        ? {
            GIT_SSL_NO_VERIFY: 'true',
          }
        : undefined,
    };

    this.options = {
      dir: this.directory,
      syncImmediately: true,
      userInfo: userInfo,
      remoteUrl: this.remoteUrl,
    };

    this.initialized = true;
  }

  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('Component not initialized. Call initialize() first.');
    }
  }

  async delete(): Promise<void> {
    this.checkInitialized();
    await this.shellWrapperService.rm('-rf', this.directory);
  }

  async save(containerStackUuid: string, content: string): Promise<void> {
    this.checkInitialized();

    const containerStack = await this.containerCustomStackRepository.findByUuid(containerStackUuid);
    if (!containerStack) {
      throw new NotFoundError(`Container Stack ${containerStackUuid} not found`);
    }

    // Write content to the file
    await this.shellWrapperService.exec(
      `echo '${content.replace(/'/g, "'\\''")}' > ${containerStack.path}`,
    );
  }

  async syncToDatabase(): Promise<void> {
    this.checkInitialized();
    this.childLogger.info('saving to database...');

    const containerStackRepository = await this.getContainerStackRepository();

    const containerStacksListFromDatabase =
      await this.containerCustomStackRepository.listAllByRepository(containerStackRepository);

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

    // Find stacks to delete (in DB but not in directory)
    const containerStacksListToDelete = containerStacksListFromDatabase?.filter((stack) => {
      return !containerStacksListFromDirectory?.some((p) => p.fullPath === stack.path);
    });

    this.childLogger.info(
      `Found ${containerStacksListToDelete?.length || 0} stacks to delete from database`,
    );

    // Delete stacks that no longer exist in the directory
    if (containerStacksListToDelete && containerStacksListToDelete.length > 0) {
      await Promise.all(
        containerStacksListToDelete?.map((stack) => {
          if (stack && stack.uuid) {
            return this.containerCustomStackRepository.deleteOneByUuid(stack.uuid);
          }
          return Promise.resolve();
        }),
      );
    }

    // Process stacks that exist in the directory
    const containerStackPathsToSync = containerStacksListFromDirectory?.filter((stack) => {
      return stack !== undefined;
    }) as FileInfo[];

    this.childLogger.info(`Stacks to sync: ${containerStackPathsToSync.length}`);

    await Promise.all(
      containerStackPathsToSync.map(async (stackPath) => {
        return this.updateOrCreateAssociatedStack(stackPath, containerStackRepository);
      }),
    );

    this.childLogger.info(`Updating Stacks Repository ${containerStackRepository.name}`);

    this.emit(Events.ALERT, {
      severity: SsmAlert.AlertType.SUCCESS,
      message: `Successfully updated repository "${containerStackRepository.name}" with ${containerStackPathsToSync.length} files`,
      module: 'ContainerCustomStackRepository',
    });
  }

  private async getContainerStackRepository(): Promise<IContainerCustomStackRepositoryEntity> {
    const containerStackRepository = await this.containerCustomStacksRepositoryRepository.findByUuid(this.uuid);
    if (!containerStackRepository) {
      throw new Error(`Repository with UUID ${this.uuid} not found`);
    }
    return containerStackRepository;
  }

  private async updateOrCreateAssociatedStack(
    foundStack: FileInfo,
    containerCustomStackRepository: any,
  ): Promise<void> {
    const stackFoundInDatabase = await this.containerCustomStackRepository.findOneByPath(
      foundStack.fullPath as string,
    );

    this.childLogger.debug(
      `Processing stack ${JSON.stringify(foundStack)} - In database: ${stackFoundInDatabase ? 'true' : 'false'}`,
    );

    // Read the file content
    const stackContent = await this.shellWrapperService.exec(`cat ${foundStack.fullPath}`);

    const embeddedProjectName = extractTopLevelName(stackContent);

    const stackData = {
      path: foundStack.fullPath,
      name:
        stackFoundInDatabase?.name ||
        embeddedProjectName ||
        foundStack.fullPath
          .split(`${this.uuid}/`)[1]
          .replaceAll('/', '-')
          .replaceAll(':', '-')
          .replaceAll('.', '-')
          .toLowerCase(),
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
    await this.containerCustomStackRepository.updateOrCreate(stackData);
  }

  fileBelongToRepository(path: string): boolean {
    this.checkInitialized();
    this.childLogger.info(
      `rootPath: ${this.directory?.split('/')[0]} versus ${path.split('/')[0]}`,
    );
    return this.directory?.split('/')[0] === path.split('/')[0];
  }

  getDirectory(): string {
    this.checkInitialized();
    return this.directory;
  }

  async clone(syncAfter = false): Promise<void> {
    this.checkInitialized();
    this.childLogger.info('Clone starting...');

    try {
      await this.containerStacksService.resetRepositoryError(this.uuid);

      // Create directory if it doesn't exist
      await this.shellWrapperService.mkdir('-p', this.directory);

      // Clone the repository
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
      await this.containerStacksService.putRepositoryOnError(this.uuid, error);
      this.childLogger.info(`Emit ${Events.ALERT} with error: ${error.message}`);
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.ERROR,
        message: `Error during git clone: ${error.message}`,
        module: 'ContainerCustomStackRepository',
      });
      throw error;
    }
  }

  async commitAndSync(): Promise<void> {
    this.checkInitialized();
    try {
      await this.containerStacksService.resetRepositoryError(this.uuid);

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
        message: `Successfully commit and sync repository "${this.name}"`,
        module: 'ContainerCustomStackRepository',
      });
    } catch (error: any) {
      this.childLogger.error(error);
      await this.containerStacksService.putRepositoryOnError(this.uuid, error);
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.ERROR,
        message: `Error during commit and sync: ${error.message}`,
        module: 'ContainerCustomStackRepository',
      });
      throw error;
    }
  }

  async forcePull(): Promise<void> {
    this.checkInitialized();
    try {
      await this.containerStacksService.resetRepositoryError(this.uuid);

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
        module: 'ContainerCustomStackRepository',
      });
    } catch (error: any) {
      this.childLogger.error(error);
      await this.containerStacksService.putRepositoryOnError(this.uuid, error);
      this.emit(Events.ALERT, {
        severity: SsmAlert.AlertType.ERROR,
        message: `Error during force pull: ${error.message}`,
        module: 'ContainerCustomStackRepository',
      });
      throw error;
    }
  }

  async init(): Promise<void> {
    this.checkInitialized();
    await this.clone();
  }

  async syncFromRepository(): Promise<void> {
    this.checkInitialized();
    await this.forcePull();
  }
}
