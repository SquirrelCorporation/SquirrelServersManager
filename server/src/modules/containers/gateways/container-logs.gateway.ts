import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SsmEvents } from 'ssm-shared-lib';
import { DateTime } from 'luxon';
import { ContainerLogsDto } from '../dto/container-logs.dto';
import { ContainerLogsService } from '../services/container-logs.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ContainerLogsGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ContainerLogsGateway.name);

  constructor(private readonly containerLogsService: ContainerLogsService) {}

  @SubscribeMessage(SsmEvents.Logs.GET_LOGS)
  async handleGetLogs(
    @MessageBody() payload: ContainerLogsDto,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<{ status: string; error?: string }>> {
    this.logger.log('getContainerLogs');

    try {
      // Validate payload
      if (!payload.containerId) {
        return { event: SsmEvents.Logs.GET_LOGS, data: { status: 'Bad Request', error: 'containerId is required' } };
      }

      // Get container and check if it exists
      const container = await this.containerLogsService.findContainerById(payload.containerId);
      if (!container) {
        return {
          event: SsmEvents.Logs.GET_LOGS,
          data: { status: 'Bad Request', error: `Container Id ${payload.containerId} not found` },
        };
      }

      // Get the registered component
      const registeredComponent = await this.containerLogsService.findRegisteredComponent(container.watcher);
      if (!registeredComponent) {
        return {
          event: SsmEvents.Logs.GET_LOGS,
          data: { status: 'Bad Request', error: `Watcher is not registered: ${container.watcher}` },
        };
      }

      // Set up the from timestamp
      const from = payload.from || DateTime.now().toUnixInteger();
      this.logger.log(`Getting container (${container.id}) logs from ${from}`);

      // Set up the callback for sending logs
      const getContainerLogsCallback = (data: string) => {
        client.emit(SsmEvents.Logs.NEW_LOGS, { data });
      };

      // Get container logs
      const closingCallback = registeredComponent.getContainerLiveLogs(
        container.id,
        from,
        getContainerLogsCallback,
      );

      // Set up event listeners for closing the connection
      client.on(SsmEvents.Logs.CLOSED, closingCallback);
      client.on(SsmEvents.Common.DISCONNECT, closingCallback);

      // Send initial connection message
      getContainerLogsCallback(`🛜 Connecting...\n`);

      return { event: SsmEvents.Logs.GET_LOGS, data: { status: 'OK' } };
    } catch (error: unknown) {
      this.logger.error('Error getting container logs', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        event: SsmEvents.Logs.GET_LOGS,
        data: { status: 'Internal Error', error: errorMessage },
      };
    }
  }
}