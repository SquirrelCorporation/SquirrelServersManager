import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnsibleLogEntity } from '../../domain/entities/ansible-log.entity';
import { IAnsibleLogsRepository } from '../../domain/repositories/ansible-logs-repository.interface';
import { AnsibleLog } from '../schemas/ansible-log.schema';
import { AnsibleLogMapper } from '../mappers/ansible-log.mapper';

@Injectable()
export class AnsibleLogsRepository implements IAnsibleLogsRepository {
  private readonly logger = new Logger(AnsibleLogsRepository.name);
  constructor(
    @InjectModel(AnsibleLog.name) private ansibleLogModel: Model<AnsibleLog>,
    private ansibleLogMapper: AnsibleLogMapper,
  ) {}

  async create(ansibleLog: Partial<AnsibleLogEntity>): Promise<AnsibleLogEntity | null> {
    const schemaLog = this.ansibleLogMapper.toPersistence(ansibleLog);
    const created = await this.ansibleLogModel.create(schemaLog);
    return this.ansibleLogMapper.toDomain(created);
  }

  async findAllByIdent(ident: string, sortDirection: 1 | -1 = -1): Promise<AnsibleLogEntity[]> {
    this.logger.log(`Finding all logs for ident: ${ident}`);
    const logs = await this.ansibleLogModel
      .find({ ident: { $eq: ident } })
      .sort({ createdAt: sortDirection })
      .exec();
    return logs
      .map((log) => this.ansibleLogMapper.toDomain(log))
      .filter((log): log is AnsibleLogEntity => log !== null);
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

  /**
   * Find logs by execution ID (aliased to findAllByIdent as they use the same field)
   * @param executionId The execution ID to search for
   * @returns Logs with the specified execution ID
   */
  async findByExecutionId(executionId: string): Promise<AnsibleLogEntity[] | null> {
    return this.findAllByIdent(executionId);
  }
}
