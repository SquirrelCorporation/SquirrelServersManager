import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DevicesModule } from '../devices/devices.module';
import { AnsibleModule } from '../ansible/ansible.module';
import { LogsModule } from '../logs/logs.module';
import { CacheModule } from '../../infrastructure/cache';
import { CRON, CronSchema } from './infrastructure/schemas/cron.schema';
import { CronRepositoryMapper } from './infrastructure/mappers/cron-repository.mapper';
import { CronRepository } from './infrastructure/repositories/cron.repository';
import { CRON_REPOSITORY } from './domain/repositories/cron-repository.interface';
import { CronService } from './application/services/cron.service';
import { CronController } from './presentation/controllers/cron.controller';
import { SystemCronService } from './application/services/system-cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CRON, schema: CronSchema },
    ]),
    ScheduleModule,
    DevicesModule,
    AnsibleModule,
    LogsModule,
    CacheModule,
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
  ],
  exports: [CronService],
})
export class SchedulerModule {}