import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateTime } from 'luxon';
import {
  ANSIBLE_TASK_STATUS_REPOSITORY,
  IAnsibleTaskStatusRepository,
} from '../../domain/repositories/ansible-task-status.repository.interface';
import { AnsibleTask } from '../schemas/ansible-task.schema';
import { IAnsibleTask } from '../../domain/entities/ansible-task.interface';
import { IAnsibleTaskRepository } from '../../domain/repositories/ansible-task.repository.interface';

@Injectable()
export class AnsibleTaskRepository implements IAnsibleTaskRepository {
  constructor(
    @InjectModel(AnsibleTask.name) private readonly ansibleTaskModel: Model<AnsibleTask>,
    @Inject(ANSIBLE_TASK_STATUS_REPOSITORY)
    private readonly ansibleTaskStatusRepository: IAnsibleTaskStatusRepository,
  ) {}

  async create(task: Partial<IAnsibleTask>): Promise<IAnsibleTask> {
    const createdTask = new this.ansibleTaskModel({
      ident: task.ident,
      name: task.name,
      playbook: task.playbook,
      cmd: task.cmd,
      status: task.status,
      target: task.target,
      options: task.options,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
    const savedTask = await createdTask.save();
    return this.mapToIAnsibleTask(savedTask);
  }

  async findAll(): Promise<IAnsibleTask[]> {
    const tasks = await this.ansibleTaskModel.find().exec();
    return tasks.map(this.mapToIAnsibleTask);
  }

  async findByIdent(ident: string): Promise<IAnsibleTask | null> {
    const task = await this.ansibleTaskModel.findOne({ ident }).exec();
    return task ? this.mapToIAnsibleTask(task) : null;
  }

  async findById(id: string): Promise<IAnsibleTask | null> {
    const task = await this.ansibleTaskModel.findById(id).exec();
    return task ? this.mapToIAnsibleTask(task) : null;
  }

  async updateStatus(ident: string, status: string): Promise<IAnsibleTask | null> {
    const updatedTask = await this.ansibleTaskModel
      .findOneAndUpdate({ ident }, { status }, { new: true })
      .exec();
    return updatedTask ? this.mapToIAnsibleTask(updatedTask) : null;
  }

  async update(id: string, update: Partial<IAnsibleTask>): Promise<IAnsibleTask | null> {
    const updatedTask = await this.ansibleTaskModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    return updatedTask ? this.mapToIAnsibleTask(updatedTask) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ansibleTaskModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private mapToIAnsibleTask(doc: any): IAnsibleTask {
    return {
      _id: doc._id.toString(),
      ident: doc.ident,
      name: doc.name,
      playbook: doc.playbook,
      status: doc.status,
      target: doc.target,
      options: doc.options,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async deleteAllTasksAndStatuses(ansibleTask: IAnsibleTask) {
    await this.ansibleTaskStatusRepository.deleteAllByIdent(ansibleTask.ident);
    // TODO Import from logs module???
    //await AnsibleLogsRepo.deleteAllByIdent(ansibleTask.ident);
  }

  async findAllOld(ageInMinutes: number): Promise<IAnsibleTask[]> {
    const tasks = await this.ansibleTaskModel
      .find({
        createdAt: { $lt: DateTime.now().minus({ minute: ageInMinutes }).toJSDate() },
      })
      .lean()
      .exec();
    return tasks.map(this.mapToIAnsibleTask);
  }

  async deleteAllOldLogsAndStatuses(ageInMinutes: number): Promise<void> {
    const tasks = await this.findAllOld(ageInMinutes);
    tasks?.forEach(async (task) => {
      await this.deleteAllTasksAndStatuses(task);
    });
  }
}
