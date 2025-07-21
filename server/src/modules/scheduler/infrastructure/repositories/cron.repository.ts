import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICronRepository } from '../../domain/repositories/cron-repository.interface';
import { ICron } from '../../domain/entities/cron.entity';
import { CRON, CronDocument } from '../schemas/cron.schema';
import { CronRepositoryMapper } from '../mappers/cron-repository.mapper';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'CronRepository' });

@Injectable()
export class CronRepository implements ICronRepository {
  constructor(
    @InjectModel(CRON) private cronModel: Model<CronDocument>,
    private readonly mapper: CronRepositoryMapper,
  ) {}

  async updateOrCreateIfNotExist(cron: ICron): Promise<ICron> {
    logger.info(`Updating or creating cron job: ${cron.name}`);

    const createdCron = await this.cronModel.findOneAndUpdate({ name: cron.name }, cron, {
      upsert: true,
      new: true,
    });

    return this.mapper.toDomain(createdCron.toObject())!;
  }

  async updateCron(cron: ICron): Promise<void> {
    logger.info(`Updating cron job: ${cron.name}`);

    await this.cronModel.findOneAndUpdate({ name: cron.name }, cron).lean().exec();
  }

  async findAll(): Promise<ICron[] | null> {
    logger.info('Finding all cron jobs');

    const crons = await this.cronModel.find().lean().exec();
    return this.mapper.toDomainList(crons);
  }

  async findByName(name: string): Promise<ICron | null> {
    logger.info(`Finding cron job by name: ${name}`);

    const cron = await this.cronModel.findOne({ name }).lean().exec();
    return this.mapper.toDomain(cron);
  }
}
