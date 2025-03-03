import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { ServerLog } from '../schemas/server-log.schema';

@Injectable()
export class ServerLogsRepository {
  constructor(@InjectModel(ServerLog.name) private serverLogModel: Model<ServerLog>) {}

  async findAll(): Promise<ServerLog[]> {
    return this.serverLogModel.find().sort({ time: -1 }).limit(10000).lean().exec();
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
