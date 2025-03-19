import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import { ContainerTemplatesQueryDto, TemplateDeployDto } from '../dtos/container-templates.dto';
import { SuccessResponse } from '../../../../middlewares/api/ApiResponse';
import { CONTAINER_TEMPLATES_SERVICE, IContainerTemplatesService } from '../../application/interfaces/container-templates-service.interface';

/**
 * Controller for container templates
 */
@Controller('container-templates')
@UseGuards(JwtAuthGuard)
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
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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
  async deploy(@Body() template: TemplateDeployDto, @Req() req: Request, @Res() res: Response) {
    try {
      const execId = await this.containerTemplatesService.deployTemplate(template, req.user);
      return new SuccessResponse('Execution in progress', { execId }).send(res);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deploy template';
      throw new HttpException(
        errorMessage,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}