import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '../../infrastructure/cache';
import { UpdateService } from './services/update.service';

@Module({
  imports: [ScheduleModule.forRoot(), HttpModule, CacheModule],
  providers: [UpdateService],
  exports: [UpdateService],
})
export class UpdateModule {}
