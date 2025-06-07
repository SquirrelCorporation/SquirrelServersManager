import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { BACKUP_VOLUME_EVENTS } from '../../constants';

interface BackupVolumeEventPayload {
  success: boolean;
  message: string;
  severity: 'info' | 'error' | 'warn';
  module: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'container-volumes',
})
export class ContainersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ContainersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @WebSocketServer()
  server!: Server; // Added definite assignment assertion

  @OnEvent(BACKUP_VOLUME_EVENTS)
  handleVolumeBackupEvent(payload: BackupVolumeEventPayload): void {
    this.logger.log('handleVolumeBackupEvent', payload);
    this.server.emit(SsmEvents.VolumeBackup.PROGRESS, payload);
  }
}
