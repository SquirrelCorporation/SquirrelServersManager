import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { ScreenResizeDto, SshSessionDto } from '@modules/ssh/presentation/dtos/ssh-session.dto';
import { SshTerminalService } from '@modules/ssh';

@Injectable()
@WebSocketGateway({
  namespace: '/ssh'
})
export class SshGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SshGateway.name);
  private readonly clientSessions = new Map<string, string>(); // Store client ID -> session ID


  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => SshTerminalService))
    private readonly sshTerminalService: SshTerminalService
  ) {}

  afterInit() {
    this.logger.log(`SSH WebSocket Gateway initialized`);
  }

  handleConnection(client: Socket) {
    // Detailed debugging information
    console.log('SSH Gateway - Connection details:', {
      id: client.id,
      nsp: client.nsp?.name,
      connected: client.connected,
      rooms: Array.from(client.rooms || [])
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected (ssh): ${client.id}`);
    // Close any SSH sessions
    this.sshTerminalService.closeClientSessions(client.id);
  }

  @SubscribeMessage(SsmEvents.SSH.START_SESSION)
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SshSessionDto,
    ): Promise<{ sessionId: string; success: boolean } | { success: false; message: string }> {
    // Create a unique request identifier based on client ID and device UUID
    const { deviceUuid, cols, rows } = payload;

    try {
      // Check if this client already has an active session
      if (this.clientSessions.has(client.id)) {
        const existingSessionId = this.clientSessions.get(client.id);
        console.log(`Client ${client.id} already has active session ${existingSessionId}. Returning existing session.`);
        return { sessionId: existingSessionId!, success: true };
      }

      const sessionId = await this.sshTerminalService.createSession(client.id, deviceUuid, cols, rows);
      this.logger.log(`Sending ack...`);

      // Store the client's session
      this.clientSessions.set(client.id, sessionId);

      return { sessionId, success: true };
    } catch (error: any) {

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error starting SSH session: ${errorMessage}`);

      return { success: false, message: errorMessage };
    }
  }


  @SubscribeMessage(SsmEvents.SSH.NEW_DATA)
  handleNewData(@ConnectedSocket() client: Socket, @MessageBody() data: string): void {

    // Only process data if we have an active session for this client
    if (this.clientSessions.has(client.id)) {
      const sessionId = this.clientSessions.get(client.id)!;
      this.sshTerminalService.sendData(sessionId, data);
    } else {
      console.log(`Ignoring data from client ${client.id} - no active session`);
    }
  }

  @SubscribeMessage(SsmEvents.SSH.SCREEN_RESIZE)
  handleResize(@ConnectedSocket() client: Socket, @MessageBody() data: ScreenResizeDto): void {
    const { cols, rows } = data;
    if (this.clientSessions.has(client.id)) {
      const sessionId = this.clientSessions.get(client.id)!;
      this.sshTerminalService.resizeTerminal(sessionId, cols, rows);
    } else {
      console.log(`Ignoring resize from client ${client.id} - no active session`);
    }
  }

  emit(event: string, data: any) {
    this.server.emit(event, data);
  }
}
