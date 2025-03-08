import { Inject, Injectable } from '@nestjs/common';
import { ICron } from '../../domain/entities/cron.entity';
import { CRON_REPOSITORY, ICronRepository } from '../../domain/repositories/cron-repository.interface';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'CronService' });

@Injectable()
export class CronService {
  constructor(
    @Inject(CRON_REPOSITORY)
    private readonly cronRepository: ICronRepository,
  ) {}

  async updateOrCreateCron(cron: ICron): Promise<ICron> {
    logger.info(`Updating or creating cron job: ${cron.name}`);
    return this.cronRepository.updateOrCreateIfNotExist(cron);
  }

  async updateCron(cron: ICron): Promise<void> {
    logger.info(`Updating cron job: ${cron.name}`);
    await this.cronRepository.updateCron(cron);
  }

  async updateLastExecution(name: string): Promise<void> {
    logger.info(`Updating last execution for cron job: ${name}`);
    await this.cronRepository.updateCron({
      name,
      lastExecution: new Date(),
      expression: '', // This will be ignored in the update
    });
  }

  async findAll(): Promise<ICron[] | null> {
    logger.info('Finding all cron jobs');
    return this.cronRepository.findAll();
  }

  async findByName(name: string): Promise<ICron | null> {
    logger.info(`Finding cron job by name: ${name}`);
    return this.cronRepository.findByName(name);
  }
}