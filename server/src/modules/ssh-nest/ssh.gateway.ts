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
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { ScreenResizeDto, SshSessionDto } from './dto/ssh-session.dto';
import { SshTerminalService } from './services/ssh-terminal.service';

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

  afterInit(server: Server) {
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
  ): Promise<WsResponse<any>> {
    try {
      this.logger.log(`Starting SSH session for device: ${payload.deviceUuid}`);
      await this.sshTerminalService.createSession(client, payload);
      return { event: SsmEvents.SSH.STATUS, data: { status: 'OK' } };
    } catch (error: any) {
      this.logger.error(`Error starting SSH session: ${error.message}`);
      return {
        event: SsmEvents.SSH.STATUS,
        data: { status: 'ERROR', message: error.message },
      };
    }
  }

  @SubscribeMessage(SsmEvents.SSH.NEW_DATA)
  handleNewData(@ConnectedSocket() client: Socket, @MessageBody() data: string): void {
    this.sshTerminalService.sendData(client.id, data);
  }

  @SubscribeMessage(SsmEvents.SSH.SCREEN_RESIZE)
  handleResize(@ConnectedSocket() client: Socket, @MessageBody() data: ScreenResizeDto): void {
    this.sshTerminalService.resizeTerminal(client.id, data);
  }
}
