import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { AnsibleTaskEntity } from '../../domain/entities/ansible-task.entity';
import { IAnsibleTaskRepository } from '../../domain/repositories/ansible-task-repository.interface';
import { AnsibleTask } from '../schemas/ansible-task.schema';
import { AnsibleTaskMapper } from '../mappers/ansible-task.mapper';
import { AnsibleLogsRepository } from './ansible-logs.repository';

@Injectable()
export class AnsibleTaskRepository implements IAnsibleTaskRepository {
  constructor(
    @InjectModel(AnsibleTask.name) private ansibleTaskModel: Model<AnsibleTask>,
    private ansibleTaskMapper: AnsibleTaskMapper,
    private ansibleLogsRepository: AnsibleLogsRepository,
  ) {}

  async create(ansibleTask: Partial<AnsibleTaskEntity>): Promise<AnsibleTaskEntity> {
    const schemaTask = this.ansibleTaskMapper.toPersistence(ansibleTask);
    const created = await this.ansibleTaskModel.create(schemaTask);
    return this.ansibleTaskMapper.toDomain(created.toObject());
  }

  async updateStatus(ident: string, status: string) {
    const updated = await this.ansibleTaskModel
      .findOneAndUpdate({ ident: { $eq: ident } }, { status: status })
      .lean()
      .exec();
    return updated ? this.ansibleTaskMapper.toDomain(updated) : null;
  }

  async findAll(): Promise<AnsibleTaskEntity[]> {
    const tasks = await this.ansibleTaskModel.find().sort({ createdAt: -1 }).lean().exec();
    return tasks.map(task => this.ansibleTaskMapper.toDomain(task));
  }

  async findAllOld(ageInMinutes: number): Promise<AnsibleTaskEntity[]> {
    const tasks = await this.ansibleTaskModel
      .find({
        createdAt: { $lt: DateTime.now().minus({ minute: ageInMinutes }).toJSDate() },
      })
      .lean()
      .exec();
    return tasks.map(task => this.ansibleTaskMapper.toDomain(task));
  }

  async deleteAllTasksAndStatuses(ansibleTask: AnsibleTaskEntity) {
    await this.ansibleLogsRepository.deleteAllByIdent(ansibleTask.ident);
  }

  async deleteAllOldLogsAndStatuses(ageInMinutes: number) {
    const tasks = await this.findAllOld(ageInMinutes);
    tasks?.forEach(async (task) => {
      await this.deleteAllTasksAndStatuses(task);
    });
  }
}