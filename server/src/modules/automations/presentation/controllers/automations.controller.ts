import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { SuccessResponse } from '../../../../middlewares/api/ApiResponse';
import { AutomationsService } from '../../application/services/automations.service';
import { Automation } from '../../domain/entities/automation.entity';
import { CreateAutomationDto } from '../dtos/create-automation.dto';
import { UpdateAutomationDto } from '../dtos/update-automation.dto';

@Controller('automations')
@UseGuards(JwtAuthGuard)
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  async findAll(@Res() res: Response) {
    const automations = await this.automationsService.findAll();
    return new SuccessResponse('', automations).send(res);
  }

  @Get('template/:templateId')
  async getTemplate(@Res() res: Response, @Param('templateId') templateId: string) {
    // This would need to be implemented based on your specific requirements
    // For now, we'll just return a placeholder
    return new SuccessResponse('Template functionality to be implemented').send(res);
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<Automation> {
    const automation = await this.automationsService.findByUuid(uuid);
    if (!automation) {
      throw new NotFoundException(`Automation with UUID ${uuid} not found`);
    }
    return automation;
  }

  @Put(':name')
  async create(@Param('name') name: string, @Body('rawChain') rawChain: any): Promise<Automation> {
    const createDto: CreateAutomationDto = {
      name,
      automationChains: rawChain,
      enabled: true,
    };
    return this.automationsService.create(createDto);
  }

  @Post(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body('name') name: string,
    @Body('rawChain') rawChain: any,
  ): Promise<void> {
    const updateDto: UpdateAutomationDto = {
      name,
      automationChains: rawChain,
    };

    const automation = await this.automationsService.findByUuid(uuid);
    if (!automation) {
      throw new NotFoundException(`Automation with UUID ${uuid} not found`);
    }

    await this.automationsService.update(uuid, updateDto);
  }

  @Post(':uuid/execute')
  async execute(@Param('uuid') uuid: string): Promise<void> {
    const automation = await this.automationsService.findByUuid(uuid);
    if (!automation) {
      throw new NotFoundException(`Automation with UUID ${uuid} not found`);
    }

    await this.automationsService.execute(uuid);
  }

  @Delete(':uuid')
  async delete(@Param('uuid') uuid: string): Promise<void> {
    const automation = await this.automationsService.findByUuid(uuid);
    if (!automation) {
      throw new NotFoundException(`Automation with UUID ${uuid} not found`);
    }

    await this.automationsService.delete(uuid);
  }
}
