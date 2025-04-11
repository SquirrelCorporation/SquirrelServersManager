import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';
import {
  CONTAINER_STACKS_SERVICE,
  IContainerStacksService,
} from '../../domain/interfaces/container-stacks-service.interface';

@Controller('container-stacks/repositories')
export class ContainerStackRepositoriesController {
  constructor(
    @Inject(CONTAINER_STACKS_SERVICE)
    private readonly containerStacksService: IContainerStacksService,
  ) {}

  @Get()
  async getAllRepositories(): Promise<IContainerCustomStackRepositoryEntity[]> {
    return this.containerStacksService.getAllRepositories();
  }

  @Get(':uuid')
  async getRepositoryByUuid(
    @Param('uuid') uuid: string,
  ): Promise<IContainerCustomStackRepositoryEntity | null> {
    return this.containerStacksService.getRepositoryByUuid(uuid);
  }

  @Post()
  async createRepository(
    @Body() repository: IContainerCustomStackRepositoryEntity,
  ): Promise<IContainerCustomStackRepositoryEntity> {
    return this.containerStacksService.createRepository(repository);
  }

  @Put(':uuid')
  async updateRepository(
    @Param('uuid') uuid: string,
    @Body() repository: Partial<IContainerCustomStackRepositoryEntity>,
  ): Promise<IContainerCustomStackRepositoryEntity> {
    return this.containerStacksService.updateRepository(uuid, repository);
  }

  @Delete(':uuid')
  async deleteRepository(@Param('uuid') uuid: string): Promise<boolean> {
    return this.containerStacksService.deleteRepositoryByUuid(uuid);
  }

  @Post(':uuid/force-pull')
  async forcePullRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.forcePullRepository(uuid);
  }

  @Post(':uuid/force-clone')
  async forceCloneRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.forceCloneRepository(uuid);
  }

  @Post(':uuid/force-register')
  async forceRegisterRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.forceRegisterRepository(uuid);
  }

  @Post(':uuid/commit-and-sync')
  async commitAndSyncRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.commitAndSyncRepository(uuid);
  }

  @Post(':uuid/sync-to-database')
  async syncToDatabaseRepository(@Param('uuid') uuid: string): Promise<void> {
    return this.containerStacksService.syncToDatabaseRepository(uuid);
  }
}
