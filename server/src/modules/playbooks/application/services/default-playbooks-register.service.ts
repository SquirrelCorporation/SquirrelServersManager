import { Repositories } from 'ssm-shared-lib';
import { Injectable, Logger } from '@nestjs/common';
import { FileSystemService } from '@modules/shell';
import { PlaybooksRegisterRepository } from '@modules/playbooks/infrastructure/repositories/playbooks-register.repository';
import { IPlaybooksRegister } from '@modules/playbooks/domain/entities/playbooks-register.entity';
import { SSM_DATA_PATH, SSM_INSTALL_PATH } from 'src/config';

/**
 * Service for managing default playbooks repositories
 */
@Injectable()
export class DefaultPlaybooksRegisterService {
  private readonly logger = new Logger(DefaultPlaybooksRegisterService.name);

  private readonly corePlaybooksRepository: Partial<IPlaybooksRegister> = {
    name: 'ssm-core',
    uuid: '00000000-0000-0000-0000-000000000000',
    enabled: true,
    type: Repositories.RepositoryType.LOCAL,
    directory: `${SSM_INSTALL_PATH}/server/src/ansible/00000000-0000-0000-0000-000000000000`,
    default: true,
  };

  private readonly toolsPlaybooksRepository: Partial<IPlaybooksRegister> = {
    name: 'ssm-tools',
    uuid: '00000000-0000-0000-0000-000000000001',
    enabled: true,
    type: Repositories.RepositoryType.LOCAL,
    directory: `${SSM_INSTALL_PATH}/server/src/ansible/00000000-0000-0000-0000-000000000001`,
    default: true,
  };

  constructor(
    private readonly playbooksRepositoryRepository: PlaybooksRegisterRepository,
    private readonly fileSystemService: FileSystemService,
  ) {}

  /**
   * Save the default SSM playbooks repositories
   */
  async saveSSMDefaultPlaybooksRepositories(): Promise<void> {
    this.logger.log('Saving default SSM playbooks repositories');

    // Check if repositories exist first
    const coreRepo = await this.playbooksRepositoryRepository.findByUuid(
      this.corePlaybooksRepository.uuid!,
    );
    if (!coreRepo) {
      await this.playbooksRepositoryRepository.create(this.corePlaybooksRepository);
    } else {
      await this.playbooksRepositoryRepository.update(
        this.corePlaybooksRepository.uuid!,
        this.corePlaybooksRepository,
      );
    }

    const toolsRepo = await this.playbooksRepositoryRepository.findByUuid(
      this.toolsPlaybooksRepository.uuid!,
    );
    if (!toolsRepo) {
      await this.playbooksRepositoryRepository.create(this.toolsPlaybooksRepository);
    } else {
      await this.playbooksRepositoryRepository.update(
        this.toolsPlaybooksRepository.uuid!,
        this.toolsPlaybooksRepository,
      );
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

    const userPlaybooksRepository: Partial<IPlaybooksRegister> = {
      name: userEmail.trim().split('@')[0] || 'user-default',
      enabled: true,
      type: Repositories.RepositoryType.LOCAL,
      directory: `${SSM_DATA_PATH}/playbooks/00000000-0000-0000-0000-000000000002`,
      uuid: '00000000-0000-0000-0000-000000000002',
    };

    // Check if repository exists first
    const userRepo = await this.playbooksRepositoryRepository.findByUuid(
      userPlaybooksRepository.uuid!,
    );
    if (!userRepo) {
      await this.playbooksRepositoryRepository.create(userPlaybooksRepository);
    } else {
      await this.playbooksRepositoryRepository.update(
        userPlaybooksRepository.uuid!,
        userPlaybooksRepository,
      );
    }

    try {
      this.fileSystemService.createDirectory(userPlaybooksRepository.directory as string);
    } catch (error: any) {
      this.logger.error(`Error creating directory: ${error.message}`);
    }
  }
}
