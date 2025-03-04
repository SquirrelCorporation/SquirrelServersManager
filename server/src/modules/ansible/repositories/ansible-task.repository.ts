import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { AnsibleTask, AnsibleTaskDocument } from '../schemas/ansible-task.schema';
import { AnsibleLogsRepository } from './ansible-logs.repository';

@Injectable()
export class AnsibleTaskRepository {
  constructor(
    @InjectModel(AnsibleTask.name) private ansibleTaskModel: Model<AnsibleTaskDocument>,
    private ansibleLogsRepository: AnsibleLogsRepository,
  ) {}

  async create(ansibleTask: Partial<AnsibleTask>): Promise<AnsibleTask> {
    const createdTask = new this.ansibleTaskModel(ansibleTask);
    const saved = await createdTask.save();
    return saved.toObject();
  }

  async findById(uuid: string): Promise<AnsibleTask | null> {
    const task = await this.ansibleTaskModel.findOne({ uuid }).lean().exec();
    return task;
  }

  async findAll(
    limit = 20,
    skip = 0,
    sort: Record<string, 1 | -1> = { startTime: -1 },
    filter = {},
  ): Promise<AnsibleTask[]> {
    const tasks = await this.ansibleTaskModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    
    return tasks;
  }

  async update(uuid: string, update: Partial<AnsibleTask>): Promise<AnsibleTask | null> {
    const updated = await this.ansibleTaskModel
      .findOneAndUpdate({ uuid }, update, { new: true })
      .lean()
      .exec();
    
    return updated;
  }

  async delete(uuid: string): Promise<AnsibleTask | null> {
    const deleted = await this.ansibleTaskModel.findOneAndDelete({ uuid }).lean().exec();
    return deleted;
  }

  async count(filter = {}): Promise<number> {
    return this.ansibleTaskModel.countDocuments(filter).exec();
  }

  async updateStatus(ident: string, status: string) {
    const updated = await this.ansibleTaskModel
      .findOneAndUpdate({ uuid: { $eq: ident } }, { status: status }, { new: true })
      .lean()
      .exec();
    
    return updated;
  }

  // Original method renamed to findAllWithoutParams to avoid conflict
  async findAllWithoutParams(): Promise<AnsibleTask[]> {
    const tasks = await this.ansibleTaskModel.find().sort({ createdAt: -1 }).lean().exec();
    return tasks;
  }

  async findAllOld(ageInMinutes: number): Promise<AnsibleTask[]> {
    const tasks = await this.ansibleTaskModel
      .find({
        createdAt: { $lt: DateTime.now().minus({ minute: ageInMinutes }).toJSDate() },
      })
      .lean()
      .exec();
    
    return tasks;
  }

  async deleteAllTasksAndStatuses(ansibleTask: AnsibleTask) {
    await this.ansibleLogsRepository.deleteByTaskId(ansibleTask.uuid);
  }

  async deleteAllOldLogsAndStatuses(ageInMinutes: number) {
    const tasks = await this.findAllOld(ageInMinutes);
    tasks?.forEach(async (task) => {
      await this.deleteAllTasksAndStatuses(task);
    });
  }
} 