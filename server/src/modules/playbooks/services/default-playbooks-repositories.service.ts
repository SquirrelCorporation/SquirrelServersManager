import { Repositories } from 'ssm-shared-lib';
import { Injectable, Logger } from '@nestjs/common';
import { PlaybooksRepositoryRepository } from '../repositories/playbooks-repository.repository';
import { FileSystemService } from '../../shell/services/file-system.service';
import { PlaybooksRepository } from '../schemas/playbooks-repository.schema';

/**
 * Service for managing default playbooks repositories
 */
@Injectable()
export class DefaultPlaybooksRepositoriesService {
  private readonly logger = new Logger(DefaultPlaybooksRepositoriesService.name);

  // Path constants
  private readonly SSM_INSTALL_PATH = process.env.SSM_INSTALL_PATH || '/opt/ssm';
  private readonly SSM_DATA_PATH = process.env.SSM_DATA_PATH || '/var/lib/ssm';

  private readonly corePlaybooksRepository: Partial<PlaybooksRepository> = {
    name: 'ssm-core',
    uuid: '00000000-0000-0000-0000-000000000000',
    enabled: true,
    type: Repositories.RepositoryType.LOCAL,
    directory: `${this.SSM_INSTALL_PATH}/server/src/ansible/00000000-0000-0000-0000-000000000000`,
    default: true,
  };

  private readonly toolsPlaybooksRepository: Partial<PlaybooksRepository> = {
    name: 'ssm-tools',
    uuid: '00000000-0000-0000-0000-000000000001',
    enabled: true,
    type: Repositories.RepositoryType.LOCAL,
    directory: `${this.SSM_INSTALL_PATH}/server/src/ansible/00000000-0000-0000-0000-000000000001`,
    default: true,
  };

  constructor(
    private readonly playbooksRepositoryRepository: PlaybooksRepositoryRepository,
    private readonly fileSystemService: FileSystemService,
  ) {}

  /**
   * Save the default SSM playbooks repositories
   */
  async saveSSMDefaultPlaybooksRepositories(): Promise<void> {
    this.logger.log('Saving default SSM playbooks repositories');
    
    // Check if repositories exist first
    const coreRepo = await this.playbooksRepositoryRepository.findByUuid(this.corePlaybooksRepository.uuid!);
    if (!coreRepo) {
      await this.playbooksRepositoryRepository.create(this.corePlaybooksRepository);
    } else {
      await this.playbooksRepositoryRepository.update(this.corePlaybooksRepository.uuid!, this.corePlaybooksRepository);
    }
    
    const toolsRepo = await this.playbooksRepositoryRepository.findByUuid(this.toolsPlaybooksRepository.uuid!);
    if (!toolsRepo) {
      await this.playbooksRepositoryRepository.create(this.toolsPlaybooksRepository);
    } else {
      await this.playbooksRepositoryRepository.update(this.toolsPlaybooksRepository.uuid!, this.toolsPlaybooksRepository);
    }
  }

  /**
   * Create a default local user repository
   */
  async createDefaultLocalUserRepository(userEmail: string): Promise<void> {
    this.logger.log('Creating default local user repository');
    
    if (!userEmail) {
      this.logger.warn('No user email provided, skipping default repository creation');
      return;
    }
    
    const userPlaybooksRepository: Partial<PlaybooksRepository> = {
      name: userEmail.trim().split('@')[0] || 'user-default',
      enabled: true,
      type: Repositories.RepositoryType.LOCAL,
      directory: `${this.SSM_DATA_PATH}/playbooks/00000000-0000-0000-0000-000000000002`,
      uuid: '00000000-0000-0000-0000-000000000002',
    };
    
    // Check if repository exists first
    const userRepo = await this.playbooksRepositoryRepository.findByUuid(userPlaybooksRepository.uuid!);
    if (!userRepo) {
      await this.playbooksRepositoryRepository.create(userPlaybooksRepository);
    } else {
      await this.playbooksRepositoryRepository.update(userPlaybooksRepository.uuid!, userPlaybooksRepository);
    }
    
    try {
      this.fileSystemService.createDirectory(userPlaybooksRepository.directory as string);
    } catch (error: any) {
      this.logger.error(`Error creating directory: ${error.message}`);
    }
  }
} 