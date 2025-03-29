import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { SsmEvents } from 'ssm-shared-lib';
import Events from '../../../../core/events/events';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DiagnosticEventsGateway {
  private readonly logger = new Logger(DiagnosticEventsGateway.name);

  @WebSocketServer()
  server!: Server;

  @OnEvent(Events.DIAGNOSTIC_CHECK)
  handleDiagnosticProgress(payload: any) {
    this.logger.debug('Diagnostic progress update');
    this.server.emit(SsmEvents.Diagnostic.PROGRESS, payload);
  }
}