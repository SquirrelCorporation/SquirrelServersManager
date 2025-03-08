import { Injectable, Logger } from '@nestjs/common';
import { Automation } from '../../domain/entities/automation.entity';
import { IAutomationRepository } from '../../domain/repositories/automation.repository.interface';
import { CreateAutomationDto } from '../../presentation/dtos/create-automation.dto';
import { UpdateAutomationDto } from '../../presentation/dtos/update-automation.dto';
import { AutomationEngine } from './automation-engine.service';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(
    private automationRepository: IAutomationRepository,
    private automationEngine: AutomationEngine,
  ) {}

  async findAll(): Promise<Automation[]> {
    return this.automationRepository.findAll();
  }

  async findAllEnabled(): Promise<Automation[]> {
    return this.automationRepository.findAllEnabled();
  }

  async findByUuid(uuid: string): Promise<Automation | null> {
    return this.automationRepository.findByUuid(uuid);
  }

  async create(createAutomationDto: CreateAutomationDto): Promise<Automation> {
    const createdAutomation = await this.automationRepository.create(createAutomationDto);
    await this.automationEngine.registerComponent(createdAutomation);
    return createdAutomation;
  }

  async update(uuid: string, updateAutomationDto: UpdateAutomationDto): Promise<void> {
    const automation = await this.findByUuid(uuid);
    if (!automation) {
      throw new Error(`Automation with uuid: ${uuid} not found`);
    }

    await this.automationEngine.deregisterComponent(automation);
    await this.automationRepository.update(uuid, updateAutomationDto);

    const updatedAutomation = await this.findByUuid(uuid);
    await this.automationEngine.registerComponent(updatedAutomation as Automation);
  }

  async delete(uuid: string): Promise<void> {
    const automation = await this.findByUuid(uuid);
    if (!automation) {
      throw new Error(`Automation with uuid: ${uuid} not found`);
    }

    await this.automationEngine.deregisterComponent(automation);
    await this.automationRepository.delete(uuid);
  }

  async execute(uuid: string): Promise<void> {
    const automation = await this.findByUuid(uuid);
    if (!automation) {
      throw new Error(`Automation with uuid: ${uuid} not found`);
    }

    try {
      await this.automationEngine.executeAutomation(automation);
      await this.setLastExecutionStatus(uuid, 'success');
    } catch (error: any) {
      await this.setLastExecutionStatus(uuid, 'failed');
      this.logger.error(`Failed to execute automation ${automation.name}: ${error.message}`);
      throw error;
    }
  }

  async setLastExecutionStatus(uuid: string, status: 'success' | 'failed'): Promise<void> {
    await this.automationRepository.setLastExecutionStatus(uuid, status);
  }
}
