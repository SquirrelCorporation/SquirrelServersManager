import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ContainerCustomStack } from '../../domain/entities/container-custom-stack.entity';
import {
  CONTAINER_STACKS_SERVICE,
  IContainerStacksService,
} from '../../domain/interfaces/container-stacks-service.interface';

@Controller('container-stacks')
export class ContainerStacksController {
  private readonly logger = new Logger(ContainerStacksController.name);
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

  @Post('deploy/:uuid')
  async deployStack(
    @Param('uuid') uuid: string,
    @Body() body: { target: string },
    @Req() req,
  ): Promise<{ execId: string }> {
    return this.containerStacksService.deployStack(uuid, body.target, req.user);
  }

  @Post('transform')
  async transformStack(@Body() body: { content: any }): Promise<{ yaml: string }> {
    this.logger.log(`Transforming stack: ${JSON.stringify(body.content)}`);
    return this.containerStacksService.transformStack(body.content);
  }

  @Post('dry-run')
  async dryRunStack(
    @Body() body: { json: any; yaml: string },
  ): Promise<{ validating: boolean; message?: string }> {
    const { json, yaml } = body;
    return this.containerStacksService.dryRunStack(json, yaml);
  }
}
