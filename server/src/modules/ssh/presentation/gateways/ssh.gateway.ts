import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { SshTerminalService } from '../../application/services/ssh-terminal.service';
import { ScreenResizeDto, SshSessionDto } from '../dtos/ssh-session.dto';

@WebSocketGateway({
  namespace: '/ssh',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
})
export class SshGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SshGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly sshTerminalService: SshTerminalService) {}

  afterInit() {
    this.logger.log('SSH WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.sshTerminalService.closeClientSessions(client.id);
  }

  @SubscribeMessage(SsmEvents.SSH.START_SESSION)
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SshSessionDto,
  ): Promise<any> {
    try {
      const { deviceUuid, cols, rows } = payload;
      const sessionId = await this.sshTerminalService.createSession(client, deviceUuid, cols, rows);

      return {
        event: SsmEvents.SSH.START_SESSION,
        data: { sessionId, success: true },
      };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error starting SSH session: ${errorMessage}`);

      return {
        event: SsmEvents.SSH.START_SESSION,
        data: { success: false, message: errorMessage },
      };
    }
  }

  @SubscribeMessage(SsmEvents.SSH.NEW_DATA)
  handleNewData(@ConnectedSocket() client: Socket, @MessageBody() data: string): void {
    const sessionId = this.sshTerminalService.getSessionIdForClient(client.id);
    if (sessionId) {
      this.sshTerminalService.sendData(sessionId, data);
    }
  }

  @SubscribeMessage(SsmEvents.SSH.SCREEN_RESIZE)
  handleResize(@ConnectedSocket() client: Socket, @MessageBody() data: ScreenResizeDto): void {
    const sessionId = this.sshTerminalService.getSessionIdForClient(client.id);
    if (sessionId) {
      const { cols, rows } = data;
      this.sshTerminalService.resizeTerminal(sessionId, cols, rows);
    }
  }
}
