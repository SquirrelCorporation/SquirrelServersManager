import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnsibleTaskStatus } from '../schemas/ansible-task-status.schema';
import { IAnsibleTaskStatus } from '../../domain/entities/ansible-task-status.interface';
import { IAnsibleTaskStatusRepository } from '../../domain/repositories/ansible-task-status.repository.interface';

@Injectable()
export class AnsibleTaskStatusRepository implements IAnsibleTaskStatusRepository {
  constructor(
    @InjectModel(AnsibleTaskStatus.name) private readonly ansibleTaskStatusModel: Model<AnsibleTaskStatus>,
  ) {}

  async create(taskStatus: Partial<IAnsibleTaskStatus>): Promise<IAnsibleTaskStatus> {
    const createdTaskStatus = new this.ansibleTaskStatusModel({
      taskIdent: taskStatus.taskIdent,
      status: taskStatus.status,
      createdAt: taskStatus.createdAt,
      updatedAt: taskStatus.updatedAt,
    });
    const savedTaskStatus = await createdTaskStatus.save();
    return this.mapToIAnsibleTaskStatus(savedTaskStatus);
  }

  async findByTaskIdent(taskIdent: string): Promise<IAnsibleTaskStatus[]> {
    const taskStatuses = await this.ansibleTaskStatusModel.find({ taskIdent }).exec();
    return taskStatuses.map(status => this.mapToIAnsibleTaskStatus(status));
  }

  private mapToIAnsibleTaskStatus(doc: any): IAnsibleTaskStatus {
    return {
      _id: doc._id.toString(),
      taskIdent: doc.taskIdent,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}