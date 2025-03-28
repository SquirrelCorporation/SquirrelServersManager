import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { ServerLogEntity } from '../../domain/entities/server-log.entity';
import { IServerLogsRepository } from '../../domain/repositories/server-logs-repository.interface';
import { ServerLog } from '../schemas/server-log.schema';
import { ServerLogMapper } from '../mappers/server-log.mapper';

@Injectable()
export class ServerLogsRepository implements IServerLogsRepository {
  constructor(
    @InjectModel(ServerLog.name) private serverLogModel: Model<ServerLog>,
    private serverLogMapper: ServerLogMapper,
  ) {}

  async findAll(): Promise<ServerLogEntity[]> {
    const logs = await this.serverLogModel.find().sort({ time: -1 }).limit(10000).lean().exec();
    return logs.map((log) => this.serverLogMapper.toDomain(log));
  }

  async deleteAllOld(ageInDays: number): Promise<void> {
    await this.serverLogModel
      .deleteMany({
        time: { $lt: DateTime.now().minus({ day: ageInDays }).toJSDate() },
      })
      .exec();
  }

  async deleteAll(): Promise<void> {
    await this.serverLogModel.deleteMany().exec();
  }
}
