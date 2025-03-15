/**
 * @deprecated This controller is deprecated and will be removed in a future version.
 * Please use the new ContainerTemplatesController in presentation/controllers/container-templates.controller.ts
 */

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { ContainerTemplatesService } from '../services/container-templates.service';
import { ContainerTemplatesQueryDto, TemplateDeployDto } from '../dto/container-templates.dto';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import { CONTAINER_TEMPLATES_SERVICE } from '../application/interfaces/container-templates-service.interface';
import { IContainerTemplatesService } from '../application/interfaces/container-templates-service.interface';

/**
 * Controller for container templates
 */
@Controller('container-templates')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class ContainerTemplatesController {
  private readonly logger = new Logger(ContainerTemplatesController.name);

  constructor(
    private readonly containerTemplatesService: ContainerTemplatesService,
    @Inject(CONTAINER_TEMPLATES_SERVICE)
    private readonly newTemplatesService: IContainerTemplatesService
  ) {}

  /**
   * Get all templates with pagination, sorting, and filtering
   * @param query Query parameters
   * @param res Express response object
   * @returns Templates with pagination metadata
   * @deprecated Use the new ContainerTemplatesController
   */
  @Get()
  async getTemplates(@Query() query: ContainerTemplatesQueryDto, @Res() res: Response) {
    this.logger.warn(`Endpoint GET /container-templates is deprecated. Please use the new controller.`);
    try {
      const result = await this.newTemplatesService.getTemplates(query);

      return new SuccessResponse('Get Templates', result.data, {
        total: result.pagination.total,
        success: result.pagination.success,
        pageSize: result.pagination.pageSize,
        current: result.pagination.current,
      }).send(res);
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
   * @deprecated Use the new ContainerTemplatesController
   */
  @Post('deploy')
  async deploy(@Body() template: TemplateDeployDto, @Req() req: Request, @Res() res: Response) {
    this.logger.warn(`Endpoint POST /container-templates/deploy is deprecated. Please use the new controller.`);
    try {
      const execId = await this.newTemplatesService.deployTemplate(template, req.user);
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
