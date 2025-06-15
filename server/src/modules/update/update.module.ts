import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UpdateService } from './services/update.service';

@Module({
  imports: [ScheduleModule, HttpModule],
  providers: [UpdateService],
  exports: [UpdateService],
})
export class UpdateModule {}
