import { Injectable, Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from '../../../../infrastructure/websocket-auth/ws-auth.guard';

@Injectable()
@WebSocketGateway({
  namespace: '/diagnostic',
})
@UseGuards(WsAuthGuard)
export class DiagnosticGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(DiagnosticGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log('Diagnostic WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected (diagnostic): ${client.id}`);
    if (client.nsp) {
      this.logger.debug(`Client namespace (diagnostic): ${client.nsp.name}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected (diagnostic): ${client.id}`);
  }

  emit(event: string, data: any) {
    this.server.emit(event, data);
  }
}
