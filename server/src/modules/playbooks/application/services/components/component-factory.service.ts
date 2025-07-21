import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileSystemService, PlaybookFileService } from '@modules/shell';
import { PlaybookRepository } from '@modules/playbooks/infrastructure/repositories/playbook.repository';
import { PlaybooksRegisterRepository } from '@modules/playbooks/infrastructure/repositories/playbooks-register.repository';
import {
  GitComponentOptions,
  LocalComponentOptions,
} from '@modules/playbooks/domain/interfaces/component-options.interface';
import {
  ITreeNodeService,
  TREE_NODE_SERVICE,
} from '@modules/playbooks/domain/interfaces/tree-node-service.interface';
import pinoLogger from '../../../../../logger';
import { GitPlaybooksRegisterComponent } from './git-playbooks-register.component';
import { LocalPlaybooksRegisterComponent } from './local-playbooks-repository.component';
import PlaybooksRegisterComponent from './abstract-playbooks-register.component';
/**
 * Factory service for creating different types of playbooks register components
 */
@Injectable()
export class PlaybooksRegisterComponentFactory implements OnModuleInit {
  private readonly logger = new Logger(PlaybooksRegisterComponentFactory.name);

  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly playbookFileService: PlaybookFileService,
    private readonly playbookRepository: PlaybookRepository,
    private readonly playbooksRegisterRepository: PlaybooksRegisterRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject(TREE_NODE_SERVICE)
    private readonly treeNodeService: ITreeNodeService,
  ) {}

  /**
   * Initialize repositories on module init
   */
  onModuleInit() {
    this.logger.log('Initializing PlaybooksRegisterComponentFactory');
    PlaybooksRegisterComponent.initializeRepositories(
      this.playbookRepository,
      this.playbooksRegisterRepository,
      this.treeNodeService,
    );
    this.logger.log('PlaybooksRegisterComponentFactory initialized');
  }

  /**
   * Create a Git playbooks register component
   * @param options Options for the Git component
   * @returns A new Git playbooks register component instance
   */
  async createGitComponent(options: GitComponentOptions): Promise<GitPlaybooksRegisterComponent> {
    this.logger.log(`Creating Git component: ${options.name} (${options.uuid})`);

    return new GitPlaybooksRegisterComponent(
      this.fileSystemService,
      this.playbookFileService,
      this.playbookRepository,
      this.playbooksRegisterRepository,
      this.eventEmitter,
      this.treeNodeService,
      options.uuid,
      pinoLogger, // Pass logger instance
      options.name,
      options.branch,
      options.email,
      options.gitUserName,
      options.accessToken,
      options.remoteUrl,
      options.gitService,
      options.ignoreSSLErrors,
    );
  }

  /**
   * Create a Local playbooks register component
   * @param options Options for the Local component
   * @returns A new Local playbooks register component instance
   */
  async createLocalComponent(
    options: LocalComponentOptions,
  ): Promise<LocalPlaybooksRegisterComponent> {
    this.logger.log(`Creating Local component: ${options.name} (${options.uuid})`);

    return new LocalPlaybooksRegisterComponent(
      this.fileSystemService,
      this.playbookFileService,
      this.playbookRepository,
      this.playbooksRegisterRepository,
      this.eventEmitter,
      this.treeNodeService,
      options.uuid,
      pinoLogger, // Pass logger instance
      options.name,
      options.directory.replace(`/${options.uuid}`, ''),
    );
  }
}
