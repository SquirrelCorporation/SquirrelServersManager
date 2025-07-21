import { SftpService } from '@modules/sftp/application/services/sftp.service';
import { Inject, Logger, UseGuards, forwardRef } from '@nestjs/common';
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
import { WsAuthGuard } from '@infrastructure/websocket-auth/ws-auth.guard';
import { ISftpService } from '../../domain/interfaces/sftp-service.interface';
import {
  SftpChmodDto,
  SftpDeleteDto,
  SftpDownloadDto,
  SftpListDirectoryDto,
  SftpMkdirDto,
  SftpRenameDto,
  SftpSessionDto,
} from '../dtos/sftp-session.dto';

@WebSocketGateway({
  namespace: '/sftp',
})
@UseGuards(WsAuthGuard)
export class SftpGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SftpGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(@Inject(forwardRef(() => SftpService)) private readonly sftpService: ISftpService) {}

  afterInit(server: Server) {
    this.logger.log('SFTP WebSocket Gateway initialized');

    // Add error event listener to the server
    server.engine?.on('connection_error', (err: any) => {
      this.logger.error(`Socket.IO connection error: ${err.message}`);
      this.logger.error(`Error code: ${err.code}`);
      this.logger.error(`Error context: ${JSON.stringify(err.context)}`);
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected (sftp): ${client.id}`);
    if (client.nsp) {
      this.logger.debug(`Client namespace (sftp): ${client.nsp.name}`);
    }
    this.logger.debug(`Client handshake (sftp): ${JSON.stringify(client.handshake)}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected (sftp): ${client.id}`);
    this.sftpService.closeClientSessions(client.id);
  }

  @SubscribeMessage(SsmEvents.SFTP.START_SESSION)
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SftpSessionDto,
  ): Promise<{ sessionId: string; success: boolean } | { success: false; message: string }> {
    try {
      this.logger.log(`Starting SFTP session for device: ${payload.deviceUuid}`);
      this.logger.debug(`Session payload: ${JSON.stringify(payload)}`);
      const sessionId = await this.sftpService.createSession(client, payload);
      return { sessionId, success: true };
    } catch (error: any) {
      this.logger.error(`Error starting SFTP session: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage(SsmEvents.SFTP.READ_DIR)
  async handleListDirectory(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SftpListDirectoryDto,
  ): Promise<void> {
    this.logger.debug(`Listing directory: ${payload.path}`);
    this.logger.debug(`Directory payload: ${JSON.stringify(payload)}`);
    await this.sftpService.listDirectory(client.id, payload.path);
  }

  @SubscribeMessage(SsmEvents.SFTP.MKDIR)
  async handleMkdir(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SftpMkdirDto,
  ): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      this.logger.debug(`Creating directory: ${payload.path}`);
      this.logger.debug(`Mkdir payload: ${JSON.stringify(payload)}`);
      this.sftpService.mkdir(client.id, payload, (response) => {
        resolve(response);
      });
    });
  }

  @SubscribeMessage(SsmEvents.SFTP.RENAME)
  async handleRename(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SftpRenameDto,
  ): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      this.logger.debug(`Renaming: ${payload.oldPath} to ${payload.newPath}`);
      this.logger.debug(`Rename payload: ${JSON.stringify(payload)}`);
      this.sftpService.rename(client.id, payload, (response) => {
        resolve(response);
      });
    });
  }

  @SubscribeMessage(SsmEvents.SFTP.CHMOD)
  async handleChmod(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SftpChmodDto,
  ): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      this.logger.debug(`Changing permissions: ${payload.path} to ${payload.mode.toString(8)}`);
      this.logger.debug(`Chmod payload: ${JSON.stringify(payload)}`);
      this.sftpService.chmod(client.id, payload, (response) => {
        resolve(response);
      });
    });
  }

  @SubscribeMessage(SsmEvents.SFTP.DELETE)
  async handleDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SftpDeleteDto,
  ): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      this.logger.debug(`Deleting ${payload.isDir ? 'directory' : 'file'}: ${payload.path}`);
      this.logger.debug(`Delete payload: ${JSON.stringify(payload)}`);
      this.sftpService.delete(client.id, payload, (response) => {
        resolve(response);
      });
    });
  }

  @SubscribeMessage(SsmEvents.SFTP.DOWNLOAD)
  async handleDownload(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SftpDownloadDto,
  ): Promise<void> {
    this.logger.debug(`Downloading file: ${payload.path}`);
    this.logger.debug(`Download payload: ${JSON.stringify(payload)}`);
    await this.sftpService.download(client.id, payload.path);
  }

  emit(event: string, data: any) {
    this.server.emit(event, data);
  }
}
