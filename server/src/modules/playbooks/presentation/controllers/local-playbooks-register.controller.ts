import { NotFoundError } from '@middlewares/api/ApiError';
import { PlaybooksRegisterService } from '@modules/playbooks/application/services/playbooks-register.service';
import { IPlaybooksRegisterRepository, PLAYBOOKS_REGISTER_REPOSITORY } from '@modules/playbooks/domain/repositories/playbooks-register-repository.interface';
import { Body, Controller, Delete, Get, Inject, Logger, Param, Post, Put } from '@nestjs/common';
import { API, Repositories } from 'ssm-shared-lib';
import { PlaybooksRegisterEngineService } from '../../application/services/engine/playbooks-register-engine.service';
import { LocalPlaybooksRegisterComponent } from '../../application/services/components/local-playbooks-repository.component';

/**
 * Controller for managing local playbooks repositories
 */
@Controller('playbooks-repository/local')
export class LocalPlaybooksRepositoryController {
  private readonly logger = new Logger(LocalPlaybooksRepositoryController.name);

  constructor(
    private readonly playbooksRegisterEngineService: PlaybooksRegisterEngineService,
    private readonly playbooksRegisterService: PlaybooksRegisterService,
    @Inject(PLAYBOOKS_REGISTER_REPOSITORY)
    private readonly playbooksRegisterRepository: IPlaybooksRegisterRepository,
  ) {}

  private getLocalComponent(uuid: string): LocalPlaybooksRegisterComponent {
    const component = this.playbooksRegisterEngineService.getRepository(uuid);
    if (!component || !(component instanceof LocalPlaybooksRegisterComponent)) {
      throw new NotFoundError(`Local repository ${uuid} not found`);
    }
    return component;
  }

  /**
   * Get all local repositories
   * @returns List of local repositories
   */
  @Get()
  async getLocalRepositories(): Promise<API.LocalPlaybooksRepository[]> {
    this.logger.log('Getting all local repositories');

    const repositories = await this.playbooksRegisterRepository.findAllByType(
      Repositories.RepositoryType.LOCAL,
    );

    return repositories as unknown as API.LocalPlaybooksRepository[];
  }

  /**
   * Update a local repository
   * @param uuid Repository UUID
   * @param repository Repository data
   */
  @Post(':uuid')
  async updateLocalRepository(
    @Param('uuid') uuid: string,
    @Body() repository: API.LocalPlaybooksRepository,
  ): Promise<void> {
    this.logger.log(`Updating local repository ${uuid}`);

    const { name, directoryExclusionList, vaults } = repository;

    await this.playbooksRegisterRepository.update(uuid, {
      name,
      directoryExclusionList,
      vaults: vaults as string[],
    });

    const register = await this.playbooksRegisterRepository.findByUuid(uuid);
    if (!register) {
      throw new NotFoundError(`Repository ${uuid} not found`);
    }

    await this.playbooksRegisterEngineService.registerRegister(register);
  }

  /**
   * Delete a local repository
   * @param uuid Repository UUID
   */
  @Delete(':uuid')
  async deleteLocalRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Deleting local repository ${uuid}`);

    const register = await this.playbooksRegisterRepository.findByUuid(uuid);
    if (!register) {
      throw new NotFoundError(`Repository ${uuid} not found`);
    }

    await this.playbooksRegisterService.deleteRepository(register);
  }

  /**
   * Add a local repository
   * @param repository Repository data
   */
  @Put()
  async addLocalRepository(@Body() repository: API.LocalPlaybooksRepository): Promise<void> {
    this.logger.log(`Adding local repository ${repository.name}`);

    const { name, directoryExclusionList, vaults } = repository;

    const register = await this.playbooksRegisterRepository.create({
      name,
      type: Repositories.RepositoryType.LOCAL,
      enabled: true,
      directory: name,
      directoryExclusionList: directoryExclusionList || [],
      vaults: vaults as string[],
    });

    await this.playbooksRegisterEngineService.registerRegister(register);
  }

  /**
   * Sync a local repository to the database
   * @param uuid Repository UUID
   */
  @Post(':uuid/sync-to-database')
  async syncToDatabaseLocalRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Syncing local repository ${uuid} to database`);

    const component = this.getLocalComponent(uuid);
    await component.syncToDatabase();
  }
}
