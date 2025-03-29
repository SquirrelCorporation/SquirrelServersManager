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
export class NotificationsGateway {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  @OnEvent(Events.UPDATED_NOTIFICATIONS)
  handleNotificationUpdates(payload: any) {
    this.logger.debug('Notifications updated');
    this.server.emit(SsmEvents.Update.NOTIFICATION_CHANGE, payload);
  }
}