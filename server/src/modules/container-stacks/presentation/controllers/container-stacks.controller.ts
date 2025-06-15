import { Body, Controller, Delete, Get, Inject, Logger, Param, Patch, Post } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ContainerCustomStack } from '../../domain/entities/container-custom-stack.entity';
import {
  CONTAINER_STACKS_SERVICE,
  IContainerStacksService,
} from '../../domain/interfaces/container-stacks-service.interface';
import {
  CONTAINER_STACKS_TAG,
  CreateStackDoc,
  DeleteStackDoc,
  DeployStackDoc,
  DryRunStackDoc,
  GetAllStacksDoc,
  TransformStackDoc,
  UpdateStackDoc,
} from '../decorators/container-stacks.decorators';

/**
 * Container Stacks Controller
 *
 * This controller handles operations related to container stacks, including
 * fetching, creating, updating, and deleting stacks.
 */
@ApiTags(CONTAINER_STACKS_TAG)
@Controller('container-stacks')
export class ContainerStacksController {
  private readonly logger = new Logger(ContainerStacksController.name);
  constructor(
    @Inject(CONTAINER_STACKS_SERVICE)
    private readonly containerStacksService: IContainerStacksService,
  ) {}

  @Get()
  @GetAllStacksDoc()
  async getAllStacks(): Promise<ContainerCustomStack[]> {
    return this.containerStacksService.getAllStacks();
  }

  @Post()
  @CreateStackDoc()
  async createStack(@Body() stack: ContainerCustomStack): Promise<ContainerCustomStack> {
    return this.containerStacksService.createStack(stack);
  }

  @Patch(':uuid')
  @UpdateStackDoc()
  async updateStack(
    @Param('uuid') uuid: string,
    @Body() stack: Partial<ContainerCustomStack>,
  ): Promise<ContainerCustomStack> {
    return this.containerStacksService.updateStack(uuid, stack);
  }

  @Delete(':uuid')
  @DeleteStackDoc()
  async deleteStack(@Param('uuid') uuid: string): Promise<boolean> {
    return this.containerStacksService.deleteStackByUuid(uuid);
  }

  @Post('deploy/:uuid')
  @DeployStackDoc()
  async deployStack(
    @Param('uuid') uuid: string,
    @Body() body: { target: string },
    @User() user,
  ): Promise<{ execId: string }> {
    return this.containerStacksService.deployStack(uuid, body.target, user);
  }

  @Post('transform')
  @TransformStackDoc()
  async transformStack(@Body() body: { content: any }): Promise<{ yaml: string }> {
    this.logger.log(`Transforming stack: ${JSON.stringify(body.content)}`);
    return this.containerStacksService.transformStack(body.content);
  }

  @Post('dry-run')
  @DryRunStackDoc()
  async dryRunStack(
    @Body() body: { json: any; yaml: string },
  ): Promise<{ validating: boolean; message?: string }> {
    const { json, yaml } = body;
    return this.containerStacksService.dryRunStack(json, yaml);
  }
}
