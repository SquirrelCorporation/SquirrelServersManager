import { Body, Controller, Delete, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import {
  CONTAINER_STACKS_SERVICE,
  IContainerStacksService,
} from '../../application/interfaces/container-stacks-service.interface';
import { IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';

@Controller('container-stacks/repositories')
@UseGuards(JwtAuthGuard)
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
}
