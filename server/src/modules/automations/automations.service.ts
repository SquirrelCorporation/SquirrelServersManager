import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutomationEngine } from './automation-engine.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { Automation, AutomationDocument } from './schemas/automation.schema';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(
    @InjectModel(Automation.name) private automationModel: Model<AutomationDocument>,
    private automationEngine: AutomationEngine,
  ) {}

  async findAll(): Promise<Automation[]> {
    return this.automationModel.find().lean().exec();
  }

  async findAllEnabled(): Promise<Automation[]> {
    return this.automationModel.find({ enabled: true }).lean().exec();
  }

  async findByUuid(uuid: string): Promise<Automation | null> {
    return this.automationModel.findOne({ uuid }).lean().exec();
  }

  async create(createAutomationDto: CreateAutomationDto): Promise<Automation> {
    const createdAutomation = await this.automationModel.create(createAutomationDto);
    await this.automationEngine.registerComponent(createdAutomation);
    return createdAutomation;
  }

  async update(uuid: string, updateAutomationDto: UpdateAutomationDto): Promise<void> {
    const automation = await this.findByUuid(uuid);
    if (!automation) {
      throw new Error(`Automation with uuid: ${uuid} not found`);
    }

    await this.automationEngine.deregisterComponent(automation);
    await this.automationModel.updateOne({ uuid }, updateAutomationDto).exec();

    const updatedAutomation = await this.findByUuid(uuid);
    await this.automationEngine.registerComponent(updatedAutomation as Automation);
  }

  async delete(uuid: string): Promise<void> {
    const automation = await this.findByUuid(uuid);
    if (!automation) {
      throw new Error(`Automation with uuid: ${uuid} not found`);
    }

    await this.automationEngine.deregisterComponent(automation);
    await this.automationModel.deleteOne({ uuid }).exec();
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
    await this.automationModel
      .updateOne(
        { uuid },
        {
          lastExecutionStatus: status,
          lastExecutionTime: new Date(),
        },
      )
      .exec();
  }
}
