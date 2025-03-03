import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnsibleLog } from '../schemas/ansible-log.schema';

@Injectable()
export class AnsibleLogsRepository {
  constructor(@InjectModel(AnsibleLog.name) private ansibleLogModel: Model<AnsibleLog>) {}

  async create(ansibleLog: Partial<AnsibleLog>): Promise<AnsibleLog> {
    const created = await this.ansibleLogModel.create(ansibleLog);
    return created.toObject();
  }

  async findAllByIdent(ident: string, sortDirection: 1 | -1 = -1): Promise<AnsibleLog[]> {
    return this.ansibleLogModel
      .find({ ident: { $eq: ident } })
      .sort({ createdAt: sortDirection })
      .lean()
      .exec();
  }

  async deleteAllByIdent(ident: string) {
    return this.ansibleLogModel
      .deleteMany({ ident: { $eq: ident } })
      .lean()
      .exec();
  }

  async deleteAll(): Promise<void> {
    await this.ansibleLogModel.deleteMany().exec();
  }
}
