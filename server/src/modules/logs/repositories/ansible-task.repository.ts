import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { AnsibleTask } from '../schemas/ansible-task.schema';
import { AnsibleLogsRepository } from './ansible-logs.repository';

@Injectable()
export class AnsibleTaskRepository {
  constructor(
    @InjectModel(AnsibleTask.name) private ansibleTaskModel: Model<AnsibleTask>,
    private ansibleLogsRepository: AnsibleLogsRepository,
  ) {}

  async create(ansibleTask: Partial<AnsibleTask>): Promise<AnsibleTask> {
    const created = await this.ansibleTaskModel.create(ansibleTask);
    return created.toObject();
  }

  async updateStatus(ident: string, status: string) {
    return await this.ansibleTaskModel
      .findOneAndUpdate({ ident: { $eq: ident } }, { status: status })
      .lean()
      .exec();
  }

  async findAll(): Promise<AnsibleTask[]> {
    return await this.ansibleTaskModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async findAllOld(ageInMinutes: number): Promise<AnsibleTask[]> {
    return await this.ansibleTaskModel
      .find({
        createdAt: { $lt: DateTime.now().minus({ minute: ageInMinutes }).toJSDate() },
      })
      .lean()
      .exec();
  }

  async deleteAllTasksAndStatuses(ansibleTask: AnsibleTask) {
    await this.ansibleLogsRepository.deleteAllByIdent(ansibleTask.ident);
  }

  async deleteAllOldLogsAndStatuses(ageInMinutes: number) {
    const tasks = await this.findAllOld(ageInMinutes);
    tasks?.forEach(async (task) => {
      await this.deleteAllTasksAndStatuses(task);
    });
  }
}
