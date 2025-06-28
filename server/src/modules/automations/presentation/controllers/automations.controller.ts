import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { AutomationsService } from '../../application/services/automations.service';
import { Automation } from '../../domain/entities/automation.entity';
import { CreateAutomationBodyDto, CreateAutomationDto } from '../dtos/create-automation.dto';
import { UpdateAutomationBodyDto, UpdateAutomationDto } from '../dtos/update-automation.dto';
import {
  AutomationsControllerDocs,
  CreateAutomationDoc,
  DeleteAutomationDoc,
  ExecuteAutomationDoc,
  GetAllAutomationsDoc,
  GetAutomationDoc,
  GetAutomationTemplateDoc,
  UpdateAutomationDoc,
} from '../decorators/automations.decorators';

@AutomationsControllerDocs()
@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  @GetAllAutomationsDoc()
  async findAll() {
    const automations = await this.automationsService.findAll();
    return automations;
  }

  @Get('template/:templateId')
  @GetAutomationTemplateDoc()
  async getTemplate(@Param('templateId') templateId: string) {
    const template = await this.automationsService.getTemplate(templateId);
    return template;
  }

  @Get(':uuid')
  @GetAutomationDoc()
  async findOne(@Param('uuid') uuid: string): Promise<Automation> {
    const automation = await this.automationsService.findByUuid(uuid);
    if (!automation) {
      throw new NotFoundException(`Automation with UUID ${uuid} not found`);
    }
    return automation;
  }

  @Put(':name')
  @CreateAutomationDoc()
  async create(
    @Param('name') name: string,
    @Body() body: CreateAutomationBodyDto,
  ): Promise<Automation> {
    const createDto: CreateAutomationDto = {
      name,
      automationChains: body.rawChain,
      enabled: true,
    };
    return this.automationsService.create(createDto);
  }

  @Post(':uuid')
  @UpdateAutomationDoc()
  async update(@Param('uuid') uuid: string, @Body() body: UpdateAutomationBodyDto): Promise<void> {
    const updateDto: UpdateAutomationDto = {
      name: body.name,
      automationChains: body.rawChain,
    };

    const automation = await this.automationsService.findByUuid(uuid);
    if (!automation) {
      throw new NotFoundException(`Automation with UUID ${uuid} not found`);
    }

    await this.automationsService.update(uuid, updateDto);
  }

  @Post(':uuid/execute')
  @ExecuteAutomationDoc()
  async execute(@Param('uuid') uuid: string): Promise<void> {
    const automation = await this.automationsService.findByUuid(uuid);
    if (!automation) {
      throw new NotFoundException(`Automation with UUID ${uuid} not found`);
    }

    await this.automationsService.execute(uuid);
  }

  @Delete(':uuid')
  @DeleteAutomationDoc()
  async delete(@Param('uuid') uuid: string): Promise<void> {
    const automation = await this.automationsService.findByUuid(uuid);
    if (!automation) {
      throw new NotFoundException(`Automation with UUID ${uuid} not found`);
    }

    await this.automationsService.delete(uuid);
  }
}
