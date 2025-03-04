import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnsibleLog, AnsibleLogDocument } from '../schemas/ansible-log.schema';

@Injectable()
export class AnsibleLogsRepository {
  constructor(
    @InjectModel(AnsibleLog.name)
    private readonly ansibleLogModel: Model<AnsibleLogDocument>,
  ) {}

  async create(log: Partial<AnsibleLog>): Promise<AnsibleLog> {
    const createdLog = new this.ansibleLogModel(log);
    const saved = await createdLog.save();
    return saved.toObject();
  }

  async findByTaskId(taskId: string): Promise<AnsibleLog[]> {
    const logs = await this.ansibleLogModel
      .find({ ident: taskId })
      .sort({ timestamp: 1 })
      .lean()
      .exec();
    return logs;
  }

  async findByTaskIdAndEvent(taskId: string, event: string): Promise<AnsibleLog[]> {
    const logs = await this.ansibleLogModel
      .find({ ident: taskId, content: event })
      .sort({ timestamp: 1 })
      .lean()
      .exec();
    return logs;
  }

  async deleteByTaskId(taskId: string): Promise<void> {
    await this.ansibleLogModel.deleteMany({ ident: taskId }).exec();
  }

  async deleteAllByIdent(ident: string): Promise<void> {
    await this.ansibleLogModel.deleteMany({ ident }).exec();
  }

  async countByTaskId(taskId: string): Promise<number> {
    return this.ansibleLogModel.countDocuments({ ident: taskId }).exec();
  }
}
