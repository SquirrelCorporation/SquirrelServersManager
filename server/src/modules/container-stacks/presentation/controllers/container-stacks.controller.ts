import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import { CONTAINER_STACKS_SERVICE, IContainerStacksService } from '../../application/interfaces/container-stacks-service.interface';
import { ContainerCustomStack, IContainerCustomStackRepositoryEntity } from '../../domain/entities/container-custom-stack.entity';

@Controller('container-stacks')
@UseGuards(JwtAuthGuard)
export class ContainerStacksController {
  constructor(
    @Inject(CONTAINER_STACKS_SERVICE)
    private readonly containerStacksService: IContainerStacksService,
  ) {}

  @Get()
  async getAllStacks(): Promise<ContainerCustomStack[]> {
    return this.containerStacksService.getAllStacks();
  }

  @Post()
  async createStack(@Body() stack: ContainerCustomStack): Promise<ContainerCustomStack> {
    return this.containerStacksService.createStack(stack);
  }

  @Put(':uuid')
  async updateStack(
    @Param('uuid') uuid: string,
    @Body() stack: Partial<ContainerCustomStack>,
  ): Promise<ContainerCustomStack> {
    return this.containerStacksService.updateStack(uuid, stack);
  }

  @Delete(':uuid')
  async deleteStack(@Param('uuid') uuid: string): Promise<boolean> {
    return this.containerStacksService.deleteStackByUuid(uuid);
  }

  @Get('repositories')
  async getAllRepositories(): Promise<IContainerCustomStackRepositoryEntity[]> {
    return this.containerStacksService.getAllRepositories();
  }

  @Get('repositories/:uuid')
  async getRepositoryByUuid(@Param('uuid') uuid: string): Promise<IContainerCustomStackRepositoryEntity | null> {
    return this.containerStacksService.getRepositoryByUuid(uuid);
  }

  @Post('repositories')
  async createRepository(@Body() repository: IContainerCustomStackRepositoryEntity): Promise<IContainerCustomStackRepositoryEntity> {
    return this.containerStacksService.createRepository(repository);
  }

  @Put('repositories/:uuid')
  async updateRepository(
    @Param('uuid') uuid: string,
    @Body() repository: Partial<IContainerCustomStackRepositoryEntity>,
  ): Promise<IContainerCustomStackRepositoryEntity> {
    return this.containerStacksService.updateRepository(uuid, repository);
  }

  @Delete('repositories/:uuid')
  async deleteRepository(@Param('uuid') uuid: string): Promise<boolean> {
    return this.containerStacksService.deleteRepositoryByUuid(uuid);
  }
}