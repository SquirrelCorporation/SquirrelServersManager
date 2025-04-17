import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';
import {
  CONTAINER_STACKS_SERVICE,
  IContainerStacksService,
} from '../../domain/interfaces/container-stacks-service.interface';
import {
  CONTAINER_STACK_REPOSITORIES_TAG,
  CommitAndSyncRepositoryDoc,
  CreateRepositoryDoc,
  DeleteRepositoryDoc,
  ForceCloneRepositoryDoc,
  ForcePullRepositoryDoc,
  ForceRegisterRepositoryDoc,
  GetAllRepositoriesDoc,
  GetRepositoryByUuidDoc,
  SyncToDatabaseRepositoryDoc,
  UpdateRepositoryDoc,
} from '../decorators/container-stack-repositories.decorators';

/**
 * Container Stack Repositories Controller
 *
 * This controller handles operations related to container stack repositories, including
 * fetching, creating, updating, and deleting repositories.
 */
@ApiTags(CONTAINER_STACK_REPOSITORIES_TAG)
@Controller('container-stacks/repositories')
export class ContainerStackRepositoriesController {
  constructor(
    @Inject(CONTAINER_STACKS_SERVICE)
    private readonly containerStacksService: IContainerStacksService,
  ) {}

  @Get()
  @GetAllRepositoriesDoc()
  async getAllRepositories(): Promise<IContainerCustomStackRepositoryEntity[]> {
    return this.containerStacksService.getAllRepositories();
  }

  @Get(':uuid')
  @GetRepositoryByUuidDoc()
  async getRepositoryByUuid(
    @Param('uuid') uuid: string,
  ): Promise<IContainerCustomStackRepositoryEntity | null> {
    return this.containerStacksService.getRepositoryByUuid(uuid);
  }

  @Post()
  @CreateRepositoryDoc()
  async createRepository(
    @Body() repository: IContainerCustomStackRepositoryEntity,
  ): Promise<IContainerCustomStackRepositoryEntity> {
    return this.containerStacksService.createRepository(repository);
  }

  @Put(':uuid')
  @UpdateRepositoryDoc()
  async updateRepository(
    @Param('uuid') uuid: string,
    @Body() repository: Partial<IContainerCustomStackRepositoryEntity>,
  ): Promise<IContainerCustomStackRepositoryEntity> {
    return this.containerStacksService.updateRepository(uuid, repository);
  }

  @Delete(':uuid')
  @DeleteRepositoryDoc()
  async deleteRepository(@Param('uuid') uuid: string): Promise<boolean> {
    return this.containerStacksService.deleteRepositoryByUuid(uuid);
  }

  @Post(':uuid/force-pull')
  @ForcePullRepositoryDoc()
  async forcePullRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.forcePullRepository(uuid);
  }

  @Post(':uuid/force-clone')
  @ForceCloneRepositoryDoc()
  async forceCloneRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.forceCloneRepository(uuid);
  }

  @Post(':uuid/force-register')
  @ForceRegisterRepositoryDoc()
  async forceRegisterRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.forceRegisterRepository(uuid);
  }

  @Post(':uuid/commit-and-sync')
  @CommitAndSyncRepositoryDoc()
  async commitAndSyncRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.commitAndSyncRepository(uuid);
  }

  @Post(':uuid/sync-to-database')
  @SyncToDatabaseRepositoryDoc()
  async syncToDatabaseRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.syncToDatabaseRepository(uuid);
  }
}
