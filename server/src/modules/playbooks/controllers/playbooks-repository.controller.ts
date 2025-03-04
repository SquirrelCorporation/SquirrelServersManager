import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { API } from 'ssm-shared-lib';
import { PlaybooksRepositoryService } from '../services/playbooks-repository.service';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { PlaybooksRepository, PlaybooksRepositoryDocument } from '../schemas/playbooks-repository.schema';

/**
 * Controller for managing playbooks repositories
 */
@Controller('playbooks-repository')
export class PlaybooksRepositoryController {
  private readonly logger = new Logger(PlaybooksRepositoryController.name);

  constructor(
    private readonly playbooksRepositoryService: PlaybooksRepositoryService,
    @InjectModel(PlaybooksRepository.name)
    private readonly playbooksRepositoryModel: Model<PlaybooksRepositoryDocument>
  ) {}

  /**
   * Get all playbooks repositories
   * @returns List of playbooks repositories
   */
  @Get()
  async getPlaybooksRepositories(): Promise<API.PlaybooksRepository[]> {
    this.logger.log('Getting all playbooks repositories');
    return await this.playbooksRepositoryService.getAllPlaybooksRepositories();
  }

  /**
   * Add a directory to a playbook repository
   * @param uuid Repository UUID
   * @param fullPath Directory path
   */
  @Post(':uuid/directory/:directoryName')
  async addDirectoryToPlaybookRepository(
    @Param('uuid') uuid: string,
    @Body() { fullPath }: { fullPath: string }
  ): Promise<void> {
    this.logger.log(`Adding directory ${fullPath} to repository ${uuid}`);
    
    const playbookRepository = await this.playbooksRepositoryModel.findOne({ uuid });
    if (!playbookRepository) {
      throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
    }
    
    await this.playbooksRepositoryService.createDirectoryInPlaybookRepository(
      playbookRepository as unknown as PlaybooksRepositoryDocument,
      fullPath
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
    @Body() { fullPath }: { fullPath: string }
  ): Promise<any> {
    this.logger.log(`Adding playbook ${playbookName} at ${fullPath} to repository ${uuid}`);
    
    const playbookRepository = await this.playbooksRepositoryModel.findOne({ uuid });
    if (!playbookRepository) {
      throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
    }
    
    return await this.playbooksRepositoryService.createPlaybookInRepository(
      playbookRepository as unknown as PlaybooksRepositoryDocument,
      fullPath,
      playbookName
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
    @Param('playbookUuid') playbookUuid: string
  ): Promise<void> {
    this.logger.log(`Deleting playbook ${playbookUuid} from repository ${uuid}`);
    
    const playbookRepository = await this.playbooksRepositoryModel.findOne({ uuid });
    if (!playbookRepository) {
      throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
    }
    
    await this.playbooksRepositoryService.deletePlaybookFromRepository(
      playbookRepository as unknown as PlaybooksRepositoryDocument,
      playbookUuid
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
    @Body() { fullPath }: { fullPath: string }
  ): Promise<void> {
    this.logger.log(`Deleting directory ${fullPath} from repository ${uuid}`);
    
    const playbookRepository = await this.playbooksRepositoryModel.findOne({ uuid });
    if (!playbookRepository) {
      throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
    }
    
    await this.playbooksRepositoryService.deleteDirectoryFromRepository(
      playbookRepository as unknown as PlaybooksRepositoryDocument,
      fullPath
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
    @Body() { content }: { content: string }
  ): Promise<void> {
    this.logger.log(`Saving playbook ${playbookUuid}`);
    await this.playbooksRepositoryService.savePlaybook(playbookUuid, content);
  }

  /**
   * Sync a repository
   * @param uuid Repository UUID
   */
  @Post(':uuid/sync')
  async syncRepository(@Param('uuid') uuid: string): Promise<void> {
    this.logger.log(`Syncing repository ${uuid}`);
    await this.playbooksRepositoryService.syncRepository(uuid);
  }
} 