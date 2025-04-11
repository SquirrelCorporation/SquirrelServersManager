import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { AutomationsService } from '../../application/services/automations.service';
import { Automation } from '../../domain/entities/automation.entity';
import { CreateAutomationDto } from '../dtos/create-automation.dto';
import { UpdateAutomationDto } from '../dtos/update-automation.dto';

@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  async findAll() {
    const automations = await this.automationsService.findAll();
    return automations;
  }

  @Get('template/:templateId')
  async getTemplate(@Param('templateId') templateId: string) {
    const template = await this.automationsService.getTemplate(templateId);
    return template;
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
