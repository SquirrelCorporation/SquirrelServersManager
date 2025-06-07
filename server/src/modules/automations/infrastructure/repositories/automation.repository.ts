import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Automation } from '../../domain/entities/automation.entity';
import { IAutomationRepository } from '../../domain/repositories/automation.repository.interface';
import { AutomationDocument } from '../schemas/automation.schema';

@Injectable()
export class AutomationRepository implements IAutomationRepository {
  constructor(@InjectModel('Automation') private automationModel: Model<AutomationDocument>) {}

  async findAll(): Promise<Automation[]> {
    return this.automationModel.find().lean().exec();
  }

  async findAllEnabled(): Promise<Automation[]> {
    return this.automationModel.find({ enabled: true }).lean().exec();
  }

  async findOne(uuid: string): Promise<Automation | null> {
    return this.automationModel.findOne({ uuid }).lean().exec();
  }

  async findByUuid(uuid: string): Promise<Automation | null> {
    return this.automationModel.findOne({ uuid }).lean().exec();
  }

  async create(automation: Automation): Promise<Automation> {
    const createdAutomation = new this.automationModel(automation);
    return createdAutomation.save();
  }

  async update(uuid: string, automation: Partial<Automation>): Promise<Automation | null> {
    await this.automationModel.updateOne({ uuid }, automation).exec();
    return this.findByUuid(uuid);
  }

  async delete(uuid: string): Promise<void> {
    await this.automationModel.deleteOne({ uuid }).exec();
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
