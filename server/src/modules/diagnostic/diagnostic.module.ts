import { Module } from '@nestjs/common';
import { EventEmitterService } from '../../core/events/event-emitter.service';
import { DevicesModule } from '../devices';
import { DiagnosticService } from './application/services/diagnostic.service';
import { DiagnosticController } from './presentation/controllers/diagnostic.controller';
import { DiagnosticMapper } from './presentation/mappers/diagnostic.mapper';
import { DiagnosticGateway } from './presentation/gateways/diagnostic.gateway';
import { DiagnosticEventsGateway } from './presentation/gateways/diagnostic-events.gateway';

@Module({
  imports: [DevicesModule],
  controllers: [DiagnosticController],
  providers: [DiagnosticService, EventEmitterService, DiagnosticMapper, DiagnosticGateway, DiagnosticEventsGateway],
  exports: [DiagnosticService],
})
export class DiagnosticModule {}
