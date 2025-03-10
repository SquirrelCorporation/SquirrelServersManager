import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SsmGit } from 'ssm-shared-lib';
import {
  PlaybookRepository,
  PlaybookRepositoryDocument,
  PlaybooksRepositoryComponent,
} from '../components/playbooks-repository.component';
import { PlaybooksRepositoryComponentFactory } from '../factories/playbooks-repository-component.factory';
import {
  GitComponentOptions,
  LocalComponentOptions,
} from '../interfaces/playbooks-repository-component.interface';
import { GitPlaybooksRepositoryComponent } from '../components/git-playbooks-repository.component';
import { LocalPlaybooksRepositoryComponent } from '../components/local-playbooks-repository.component';

/**
 * Service for managing playbooks repository components
 */
@Injectable()
export class PlaybooksRegisterEngineService {
  private readonly logger = new Logger(PlaybooksRegisterEngineService.name);
  private readonly components: Record<string, PlaybooksRepositoryComponent> = {};

  constructor(
    @Inject(forwardRef(() => PlaybooksRepositoryComponentFactory))
    private readonly componentFactory: PlaybooksRepositoryComponentFactory,
    @InjectModel(PlaybookRepository.name)
    private readonly repositoryModel: Model<PlaybookRepositoryDocument>,
  ) {}

  /**
   * Register a repository component
   * @param repository Repository document to register
   */
  async registerRepository(repository: PlaybookRepositoryDocument): Promise<void> {
    try {
      this.logger.log(`Registering repository ${repository.name} (${repository.uuid})`);

      if (this.components[repository.uuid]) {
        this.logger.log(`Repository ${repository.name} already registered, skipping`);
        return;
      }

      let component: GitPlaybooksRepositoryComponent | LocalPlaybooksRepositoryComponent;

      if (repository.type === 'git') {
        const options: GitComponentOptions = {
          uuid: repository.uuid,
          name: repository.name,
          branch: repository.branch || 'main',
          email: repository.email || 'squirrel@example.com',
          gitUserName: repository.gitUserName || 'Squirrel',
          accessToken: repository.accessToken || '',
          remoteUrl: repository.remoteUrl || '',
          gitService: (repository.gitService as SsmGit.Services) || SsmGit.Services.Github,
          ignoreSSLErrors: repository.ignoreSSLErrors || false,
        };

        component = await this.componentFactory.createGitComponent(options);
      } else {
        const options: LocalComponentOptions = {
          uuid: repository.uuid,
          name: repository.name,
          directory: repository.directory || repository.uuid,
        };

        component = await this.componentFactory.createLocalComponent(options);
      }

      // Initialize the component
      await component.init();

      // Register the component
      this.components[repository.uuid] = component;

      this.logger.log(`Repository ${repository.name} registered successfully`);
    } catch (error: any) {
      this.logger.error(
        `Failed to register repository ${repository.name}: ${error?.message || 'Unknown error'}`,
      );
      throw new Error(`Failed to register repository: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Deregister a repository component
   * @param repositoryUuid UUID of the repository to deregister
   */
  async deregisterRepository(repositoryUuid: string): Promise<void> {
    try {
      this.logger.log(`Deregistering repository ${repositoryUuid}`);

      const component = this.components[repositoryUuid];
      if (!component) {
        this.logger.log(`Repository ${repositoryUuid} not registered, skipping`);
        return;
      }

      // Delete the component
      await component.delete();

      // Remove from components map
      delete this.components[repositoryUuid];

      this.logger.log(`Repository ${repositoryUuid} deregistered successfully`);
    } catch (error: any) {
      this.logger.error(
        `Failed to deregister repository ${repositoryUuid}: ${error?.message || 'Unknown error'}`,
      );
      throw new Error(`Failed to deregister repository: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get a repository component
   * @param repositoryUuid UUID of the repository to get
   * @returns Repository component
   */
  getRepository(repositoryUuid: string): PlaybooksRepositoryComponent | undefined {
    return this.components[repositoryUuid];
  }

  /**
   * Get all repository components
   * @returns Map of repository components
   */
  getState(): Record<string, PlaybooksRepositoryComponent> {
    return this.components;
  }
}
