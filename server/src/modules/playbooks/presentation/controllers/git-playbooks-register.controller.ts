import { NotFoundError } from '@middlewares/api/ApiError';
import { DEFAULT_VAULT_ID, VaultCryptoService } from '@modules/ansible-vault';
import { PlaybooksRegisterService } from '@modules/playbooks';
import { IPlaybooksRegisterRepository, PLAYBOOKS_REGISTER_REPOSITORY } from '@modules/playbooks/domain/repositories/playbooks-register-repository.interface';
import { Body, Controller, Delete, Get, Inject, Logger, Param, Post, Put } from '@nestjs/common';
import { API, Repositories } from 'ssm-shared-lib';
import { PlaybooksRegisterEngineService } from '../../application/services/engine/playbooks-register-engine.service';
import { GitPlaybooksRegisterComponent } from '../../application/services/components/git-playbooks-register.component';

/**
 * Controller for managing Git playbooks repositories
 */
@Controller('playbooks-repository/git')
export class GitPlaybooksRepositoryController {
  private readonly logger = new Logger(GitPlaybooksRepositoryController.name);

  constructor(
    private readonly playbooksRegisterEngineService: PlaybooksRegisterEngineService,
    private readonly playbooksRegisterService: PlaybooksRegisterService,
    @Inject(PLAYBOOKS_REGISTER_REPOSITORY)
    private readonly playbooksRegisterRepository: IPlaybooksRegisterRepository,
    private readonly vaultCryptoService: VaultCryptoService,
  ) {}

  private getGitComponent(uuid: string): GitPlaybooksRegisterComponent {
    const component = this.playbooksRegisterEngineService.getRepository(uuid);
    if (!component || !(component instanceof GitPlaybooksRegisterComponent)) {
      throw new NotFoundError(`Git repository ${uuid} not found`);
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

    const register = await this.playbooksRegisterService.createGitRepository(
      name,
      await this.vaultCryptoService.encrypt(accessToken as string, DEFAULT_VAULT_ID),
      branch,
      email,
      userName,
      remoteUrl,
      gitService,
      directoryExclusionList || [],
      vaults as string[],
      ignoreSSLErrors,
    );

    await this.playbooksRegisterEngineService.registerRegister(register);
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

    const register = await this.playbooksRegisterService.updateRepository(
      uuid,
      {
        name,
        accessToken: await this.vaultCryptoService.encrypt(accessToken as string, DEFAULT_VAULT_ID),
        branch,
        email,
        userName,
        remoteUrl,
        gitService,
        directoryExclusionList: directoryExclusionList || [],
        vaults: vaults as string[],
        ignoreSSLErrors,
      }
    );

    await this.playbooksRegisterEngineService.registerRegister(register);
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
      throw new NotFoundError(`Repository ${uuid} not found`);
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
    const component = this.getGitComponent(uuid);
    await component.syncFromRepository();
  }

  /**
   * Force clone a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/force-clone')
  async forceCloneRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Force cloning Git repository ${uuid}`);
    const component = this.getGitComponent(uuid);
    await component.init();
  }

  /**
   * Commit and sync a Git repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/commit-and-sync')
  async commitAndSyncRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Committing and syncing Git repository ${uuid}`);
    const component = this.getGitComponent(uuid);
    await component.syncFromRepository();
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
      throw new NotFoundError(`Repository ${uuid} not found`);
    }

    await this.playbooksRegisterEngineService.registerRegister(register);
  }
}
