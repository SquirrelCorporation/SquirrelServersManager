import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { GitComponentOptions, LocalComponentOptions } from '../interfaces/playbooks-repository-component.interface';
import { PlaybooksRepositoryComponent, Playbook, PlaybookDocument, PlaybookRepository, PlaybookRepositoryDocument } from '../components/playbooks-repository.component';
import { GitPlaybooksRepositoryComponent } from '../components/git-playbooks-repository.component';
import { LocalPlaybooksRepositoryComponent } from '../components/local-playbooks-repository.component';
import { FileSystemService } from '../../shell/services/file-system.service';
import { PlaybooksRepositoryService } from '../services/playbooks-repository.service';
import { GitPlaybooksRepositoryService } from '../services/git-playbooks-repository.service';
import { LocalPlaybooksRepositoryService } from '../services/local-playbooks-repository.service';
import { PlaybooksRepositoryRepository } from '../repositories/playbooks-repository.repository';

/**
 * Factory for creating playbooks repository components
 */
@Injectable()
export class PlaybooksRepositoryComponentFactory {
  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly playbooksRepositoryService: PlaybooksRepositoryService,
    private readonly gitPlaybooksRepositoryService: GitPlaybooksRepositoryService,
    private readonly localPlaybooksRepositoryService: LocalPlaybooksRepositoryService,
    private readonly playbooksRepositoryRepository: PlaybooksRepositoryRepository,
    private readonly eventEmitter: EventEmitter2,
    @InjectModel(Playbook.name) private readonly playbookModel: Model<PlaybookDocument>,
    @InjectModel(PlaybookRepository.name) private readonly repositoryModel: Model<PlaybookRepositoryDocument>,
  ) {}

  /**
   * Create a Git repository component
   * @param options Git component options
   * @returns Initialized Git repository component
   */
  async createGitComponent(options: GitComponentOptions): Promise<GitPlaybooksRepositoryComponent> {
    const component = new GitPlaybooksRepositoryComponent(
      this.fileSystemService,
      this.playbooksRepositoryService,
      this.gitPlaybooksRepositoryService,
      this.playbooksRepositoryRepository,
      this.eventEmitter,
      this.playbookModel,
      this.repositoryModel,
    );
    
    await component.initializeWithOptions(options);
    return component;
  }

  /**
   * Create a Local repository component
   * @param options Local component options
   * @returns Initialized Local repository component
   */
  async createLocalComponent(options: LocalComponentOptions): Promise<LocalPlaybooksRepositoryComponent> {
    const component = new LocalPlaybooksRepositoryComponent(
      this.fileSystemService,
      this.playbooksRepositoryService,
      this.localPlaybooksRepositoryService,
      this.playbooksRepositoryRepository,
      this.eventEmitter,
      this.playbookModel,
      this.repositoryModel,
    );
    
    await component.initializeWithOptions(options);
    return component;
  }

  /**
   * Create a repository component based on type
   * @param type Type of repository ('git' or 'local')
   * @param options Component options
   * @returns Initialized repository component
   */
  async createComponent(type: string, options: GitComponentOptions | LocalComponentOptions): Promise<PlaybooksRepositoryComponent> {
    switch (type.toLowerCase()) {
      case 'git':
        return await this.createGitComponent(options as GitComponentOptions);
      case 'local':
        return await this.createLocalComponent(options as LocalComponentOptions);
      default:
        throw new Error(`Unsupported repository type: ${type}`);
    }
  }
} 