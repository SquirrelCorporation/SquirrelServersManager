import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import {
  CONTAINER_TEMPLATES_SERVICE,
  IContainerTemplatesService,
} from '../../domain/interfaces/container-templates-service.interface';
import { ContainerTemplatesQueryDto } from '../dtos/container-templates.dto';

/**
 * Controller for container templates
 */
@Controller('container-templates')
@UsePipes(new ValidationPipe({ transform: true }))
export class ContainerTemplatesController {
  constructor(
    @Inject(CONTAINER_TEMPLATES_SERVICE)
    private readonly containerTemplatesService: IContainerTemplatesService,
  ) {}

  /**
   * Get all templates with pagination, sorting, and filtering
   * @param query Query parameters
   * @param res Express response object
   * @returns Templates with pagination metadata
   */
  @Get()
  async getTemplates(@Query() query: ContainerTemplatesQueryDto) {
    try {
      const result = await this.containerTemplatesService.getTemplates(query);

      return result.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get templates';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Deploy a container template
   * @param template Template to deploy
   * @param req Express request object
   * @param res Express response object
   * @returns Execution ID
   */
  @Post('deploy')
  async deploy(@Body() template: any, @User() user) {
    try {
      const execId = await this.containerTemplatesService.deployTemplate(template, user);
      return execId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deploy template';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
