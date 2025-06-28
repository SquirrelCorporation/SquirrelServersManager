import { Body, Controller, Delete, Get, Inject, Logger, Param, Patch, Post } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { ContainerCustomStack } from '../../domain/entities/container-custom-stack.entity';
import {
  CONTAINER_STACKS_SERVICE,
  IContainerStacksService,
} from '../../domain/interfaces/container-stacks-service.interface';
import {
  CreateStackDto,
  DeployStackDto,
  DeployStackResponseDto,
  DryRunStackDto,
  DryRunStackResponseDto,
  TransformStackDto,
  TransformStackResponseDto,
  UpdateStackDto,
} from '../dtos/stack-operations.dto';
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
  async createStack(@Body() createStackDto: CreateStackDto): Promise<ContainerCustomStack> {
    const stack: Partial<ContainerCustomStack> = {
      uuid: uuidv4(),
      name: createStackDto.name,
      description: createStackDto.description,
    };

    // The 'content' field from DTO doesn't directly map to entity fields
    // We need to determine how to store this - possibly in yaml or another field
    // For now, let's use Partial<ContainerCustomStack> to avoid the type error
    return this.containerStacksService.createStack(stack as ContainerCustomStack);
  }

  @Patch(':uuid')
  @UpdateStackDoc()
  async updateStack(
    @Param('uuid') uuid: string,
    @Body() updateStackDto: UpdateStackDto,
  ): Promise<ContainerCustomStack> {
    const updates = {
      name: updateStackDto.name,
      content: updateStackDto.content,
      description: updateStackDto.description,
    };
    return this.containerStacksService.updateStack(uuid, updates);
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
    @Body() deployDto: DeployStackDto,
    @User() user,
  ): Promise<DeployStackResponseDto> {
    const result = await this.containerStacksService.deployStack(uuid, deployDto.target, user);
    return { execId: result.execId };
  }

  @Post('transform')
  @TransformStackDoc()
  async transformStack(
    @Body() transformDto: TransformStackDto,
  ): Promise<TransformStackResponseDto> {
    this.logger.log(`Transforming stack: ${JSON.stringify(transformDto.content)}`);
    const result = await this.containerStacksService.transformStack(transformDto.content);
    return { yaml: result.yaml };
  }

  @Post('dry-run')
  @DryRunStackDoc()
  async dryRunStack(@Body() dryRunDto: DryRunStackDto): Promise<DryRunStackResponseDto> {
    const { json, yaml } = dryRunDto;
    const result = await this.containerStacksService.dryRunStack(json, yaml);
    return {
      validating: result.validating,
      message: result.message,
    };
  }
}
