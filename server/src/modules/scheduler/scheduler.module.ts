import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DevicesModule } from '../devices/devices.module';
import { CRON, CronSchema } from './infrastructure/schemas/cron.schema';
import { CronRepositoryMapper } from './infrastructure/mappers/cron-repository.mapper';
import { CronRepository } from './infrastructure/repositories/cron.repository';
import { CRON_REPOSITORY } from './domain/repositories/cron-repository.interface';
import { CronService } from './application/services/cron.service';
import { CronController } from './presentation/controllers/cron.controller';
import { SystemCronService } from './application/services/system-cron.service';

// For now, since we don't have proper interfaces for these repositories
// We'll create simple providers for them
const ansibleTaskRepoProvider = {
  provide: 'IAnsibleTaskRepository',
  useFactory: () => {
    return require('../../../../data/database/repository/AnsibleTaskRepo').default;
  },
};

const logsRepoProvider = {
  provide: 'ILogsRepository',
  useFactory: () => {
    return require('../../../../data/database/repository/LogsRepo').default;
  },
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CRON, schema: CronSchema },
    ]),
    ScheduleModule.forRoot(),
    DevicesModule,
  ],
  controllers: [CronController],
  providers: [
    CronService,
    SystemCronService,
    CronRepositoryMapper,
    {
      provide: CRON_REPOSITORY,
      useClass: CronRepository,
    },
    ansibleTaskRepoProvider,
    logsRepoProvider,
  ],
  exports: [CronService],
})
export class SchedulerModule {}