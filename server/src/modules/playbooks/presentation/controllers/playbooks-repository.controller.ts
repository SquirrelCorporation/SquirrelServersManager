import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { PlaybooksRegisterRepository } from '@modules/playbooks/infrastructure/repositories/playbooks-register.repository';
import { NotFoundError } from '@middlewares/api/ApiError';
import { PlaybooksRegisterService } from '@modules/playbooks/application/services/playbooks-register.service';


/**
 * Controller for managing playbooks repositories
 */
@Controller('playbooks-repository')
export class PlaybooksRepositoryController {
  private readonly logger = new Logger(PlaybooksRepositoryController.name);

  constructor(
    private readonly playbooksRegisterService: PlaybooksRegisterService,
    private readonly playbooksRegisterRepository: PlaybooksRegisterRepository,
  ) {}

  /**
   * Get all playbooks repositories
   * @returns List of playbooks repositories
   */
  @Get()
  async getPlaybooksRepositories(): Promise<API.PlaybooksRepository[]> {
    this.logger.log('Getting all playbooks repositories');
    return await this.playbooksRegisterService.getAllPlaybooksRepositories();
  }

  /**
   * Add a directory to a playbook repository
   * @param uuid Repository UUID
   * @param fullPath Directory path
   */
  @Post(':uuid/directory/:directoryName')
  async addDirectoryToPlaybookRepository(
    @Param('uuid') uuid: string,
    @Body() { fullPath }: { fullPath: string },
  ): Promise<void> {
    this.logger.log(`Adding directory ${fullPath} to repository ${uuid}`);

    const playbooksRegister = await this.playbooksRegisterRepository.findByUuid( uuid);
    if (!playbooksRegister) {
      throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
    }

    await this.playbooksRegisterService.createDirectoryInPlaybookRepository(
      playbooksRegister,
      fullPath,
    );
  }

  /**
   * Add a playbook to a repository
   * @param uuid Repository UUID
   * @param playbookName Playbook name
   * @param fullPath Playbook path
   * @returns Created playbook
   */
  @Post(':uuid/playbook/:playbookName')
  async addPlaybookToRepository(
    @Param('uuid') uuid: string,
    @Param('playbookName') playbookName: string,
    @Body() { fullPath }: { fullPath: string },
  ): Promise<any> {
    this.logger.log(`Adding playbook ${playbookName} at ${fullPath} to repository ${uuid}`);

    const playbooksRegister = await this.playbooksRegisterRepository.findByUuid( uuid);
    if (!playbooksRegister) {
      throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
    }

    return await this.playbooksRegisterService.createPlaybookInRepository(
      playbooksRegister,
      fullPath,
      playbookName,
    );
  }

  /**
   * Delete a playbook from a repository
   * @param uuid Repository UUID
   * @param playbookUuid Playbook UUID
   */
  @Post(':uuid/playbook/:playbookUuid/delete')
  async deletePlaybookFromRepository(
    @Param('uuid') uuid: string,
    @Param('playbookUuid') playbookUuid: string,
  ): Promise<void> {
    this.logger.log(`Deleting playbook ${playbookUuid} from repository ${uuid}`);

    const playbooksRegister = await this.playbooksRegisterRepository.findByUuid( uuid);
    if (!playbooksRegister) {
      throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
    }

    await this.playbooksRegisterService.deletePlaybookFromRepository(
      playbooksRegister,
      playbookUuid,
    );
  }

  /**
   * Delete a directory from a repository
   * @param uuid Repository UUID
   * @param fullPath Directory path
   */
  @Post(':uuid/directory/delete')
  async deleteDirectoryFromRepository(
    @Param('uuid') uuid: string,
    @Body() { fullPath }: { fullPath: string },
  ): Promise<void> {
    this.logger.log(`Deleting directory ${fullPath} from repository ${uuid}`);

    const playbooksRegister = await this.playbooksRegisterRepository.findByUuid( uuid);
    if (!playbooksRegister) {
      throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
    }

    await this.playbooksRegisterService.deleteDirectoryFromRepository(
      playbooksRegister,
      fullPath,
    );
  }

  /**
   * Save a playbook
   * @param playbookUuid Playbook UUID
   * @param content Playbook content
   */
  @Post('playbook/:playbookUuid/save')
  async savePlaybook(
    @Param('playbookUuid') playbookUuid: string,
    @Body() { content }: { content: string },
  ): Promise<void> {
    this.logger.log(`Saving playbook ${playbookUuid}`);
    await this.playbooksRegisterService.savePlaybook(playbookUuid, content);
  }

  /**
   * Sync a repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/sync')
  async syncRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Syncing repository ${uuid}`);
    await this.playbooksRegisterService.syncRepository(uuid);
  }
}
