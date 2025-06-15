import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [ConfigModule],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
