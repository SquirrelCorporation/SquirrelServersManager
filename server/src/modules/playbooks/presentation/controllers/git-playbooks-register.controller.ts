import { EntityNotFoundException } from '@infrastructure/exceptions/app-exceptions';
import {
  DEFAULT_VAULT_ID,
  VAULT_CRYPTO_SERVICE,
  VaultCryptoService,
} from '@modules/ansible-vaults';
import { PLAYBOOKS_REGISTER_ENGINE_SERVICE } from '@modules/playbooks';
import {
  IPlaybooksRegisterRepository,
  PLAYBOOKS_REGISTER_REPOSITORY,
} from '@modules/playbooks/domain/repositories/playbooks-register-repository.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { API, Repositories } from 'ssm-shared-lib';
import { GitPlaybooksRegisterComponent } from '../../application/services/components/git-playbooks-register.component';
import { PlaybooksRegisterEngineService } from '../../application/services/engine/playbooks-register-engine.service';
import { PlaybooksRegisterService } from '../../application/services/playbooks-register.service';
import { IPlaybooksRegister } from '../../domain/entities/playbooks-register.entity';
import { PLAYBOOKS_REGISTER_SERVICE } from '../../domain/services/playbooks-register-service.interface';
import { v4 } from 'uuid';
import PlaybooksRegisterComponent from '@modules/playbooks/application/services/components/abstract-playbooks-register.component';

/**
 * Controller for managing Git playbooks repositories
 */
@Controller('playbooks/repositories/git')
export class GitPlaybooksRepositoryController {
  private readonly logger = new Logger(GitPlaybooksRepositoryController.name);

  constructor(
    @Inject(PLAYBOOKS_REGISTER_ENGINE_SERVICE)
    private readonly playbooksRegisterEngineService: PlaybooksRegisterEngineService,
    @Inject(PLAYBOOKS_REGISTER_SERVICE)
    private readonly playbooksRegisterService: PlaybooksRegisterService,
    @Inject(PLAYBOOKS_REGISTER_REPOSITORY)
    private readonly playbooksRegisterRepository: IPlaybooksRegisterRepository,
    @Inject(VAULT_CRYPTO_SERVICE)
    private readonly vaultCryptoService: VaultCryptoService,
  ) {}

  private getGitComponent(uuid: string): GitPlaybooksRegisterComponent {
    const component = this.playbooksRegisterEngineService.getRepository(uuid);
    if (!component || !(component instanceof GitPlaybooksRegisterComponent)) {
      throw new EntityNotFoundException('GitRepository', uuid);
    }
    return component;
  }

  /**
   * Add a Git repository
   * @param repository Repository data
   */
  @Put()
  async addGitRepository(@Body() repository: API.GitPlaybooksRepository): Promise<void> {
    this.logger.log(`Adding Git repository ${repository.name}`);

    const {
      name,
      accessToken,
      branch,
      email,
      userName,
      remoteUrl,
      directoryExclusionList,
      gitService,
      vaults,
      ignoreSSLErrors,
    } = repository;
    // TODO: move to service
    const uuid = v4();
    // Create the Git repository
    const encryptedToken = await this.vaultCryptoService.encrypt(
      accessToken as string,
      DEFAULT_VAULT_ID,
    );
    const component = (await this.playbooksRegisterEngineService.registerRegister({
      uuid,
      type: Repositories.RepositoryType.GIT,
      name,
      branch,
      email,
      userName,
      accessToken: encryptedToken,
      remoteUrl,
      enabled: true,
      directoryExclusionList,
      gitService,
      ignoreSSLErrors,
    })) as PlaybooksRegisterComponent;

    await this.playbooksRegisterRepository.create({
      uuid,
      type: Repositories.RepositoryType.GIT,
      name,
      remoteUrl,
      accessToken: encryptedToken,
      branch,
      email,
      userName,
      directory: component.getDirectory(),
      enabled: true,
      directoryExclusionList,
      gitService,
      vaults,
      ignoreSSLErrors,
    });
  }

  /**
   * Get all Git repositories
   * @returns List of Git repositories
   */
  @Get()
  async getGitRepositories(): Promise<API.GitPlaybooksRepository[]> {
    this.logger.log('Getting all Git repositories');

    const registers = await this.playbooksRegisterRepository.findAllByType(
      Repositories.RepositoryType.GIT,
    );

    return registers.map((repo) => ({
      ...repo,
      accessToken: 'REDACTED',
    })) as unknown as API.GitPlaybooksRepository[];
  }

  /**
   * Update a Git repository
   * @param uuid Repository UUID
   * @param repository Repository data
   */
  @Post(':uuid')
  async updateGitRepository(
    @Param('uuid') uuid: string,
    @Body() repository: API.GitPlaybooksRepository,
  ): Promise<void> {
    this.logger.log(`Updating Git repository ${uuid}`);

    const {
      name,
      accessToken,
      branch,
      email,
      userName,
      remoteUrl,
      directoryExclusionList,
      gitService,
      vaults,
      ignoreSSLErrors,
    } = repository;

    const encryptedToken = await this.vaultCryptoService.encrypt(
      accessToken as string,
      DEFAULT_VAULT_ID,
    );

    // Find the repository
    const existingRegister = await this.playbooksRegisterRepository.findByUuid(uuid);
    if (!existingRegister) {
      throw new EntityNotFoundException('Repository', uuid);
    }

    // Update the repository
    const updatedRegister = await this.playbooksRegisterRepository.update(uuid, {
      name,
      accessToken: encryptedToken,
      branch,
      email,
      userName,
      remoteUrl,
      gitService,
      directoryExclusionList: directoryExclusionList || [],
      vaults: vaults as string[],
      ignoreSSLErrors,
    });

    await this.playbooksRegisterEngineService.registerRegister(
      updatedRegister as IPlaybooksRegister,
    );
  }

  /**
   * Delete a Git repository
   * @param uuid Repository UUID
   */
  @Delete(':uuid')
  async deleteGitRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Deleting Git repository ${uuid}`);

    const register = await this.playbooksRegisterRepository.findByUuid(uuid);
    if (!register) {
      throw new EntityNotFoundException('Repository', uuid);
    }

    await this.playbooksRegisterService.deleteRepository(register);
  }

  /**
   * Force pull a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/force-pull')
  async forcePullRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Force pulling Git repository ${uuid}`);
    try {
      const component = this.getGitComponent(uuid);
      await component.syncFromRepository();
    } catch (error: any) {
      this.logger.error(
        error,
        `Error force pulling Git repository ${uuid}: ${error?.message || 'Unknown error'}`,
      );
      throw new InternalServerErrorException(
        `Error force pulling Git repository ${uuid}: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Force clone a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/force-clone')
  async forceCloneRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Force cloning Git repository ${uuid}`);
    try {
      const component = this.getGitComponent(uuid);
      await component.init();
    } catch (error: any) {
      this.logger.error(
        error,
        `Error force cloning Git repository ${uuid}: ${error?.message || 'Unknown error'}`,
      );
      throw new InternalServerErrorException(
        `Error force cloning Git repository ${uuid}: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Commit and sync a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/commit-and-sync')
  async commitAndSyncRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Committing and syncing Git repository ${uuid}`);
    try {
      const component = this.getGitComponent(uuid);
      await component.syncFromRepository();
    } catch (error: any) {
      this.logger.error(
        error,
        `Error committing and syncing Git repository ${uuid}: ${error?.message || 'Unknown error'}`,
      );
      throw new InternalServerErrorException(
        `Error committing and syncing Git repository ${uuid}: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Force register a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/force-register')
  async forceRegister(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Force registering Git repository ${uuid}`);

    const register = await this.playbooksRegisterRepository.findByUuid(uuid);
    if (!register) {
      throw new EntityNotFoundException('Repository', uuid);
    }

    await this.playbooksRegisterEngineService.registerRegister(register);
  }

  /**
   * Sync a Git repository to the database
   * @param uuid Repository UUID
   */
  @Post(':uuid/sync-to-database')
  async syncToDatabase(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Syncing Git repository ${uuid} to database`);
    const component = this.getGitComponent(uuid);
    await component.syncToDatabase();
  }
}
