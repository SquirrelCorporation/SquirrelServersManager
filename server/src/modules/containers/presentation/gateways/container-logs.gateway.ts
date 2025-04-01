import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { SsmEvents } from 'ssm-shared-lib';
import { DateTime } from 'luxon';
import {
  CONTAINER_LOGS_SERVICE,
  IContainerLogsService,
} from '../../application/interfaces/container-logs-service.interface';
import PinoLogger from '../../../../logger';
import { IContainerService } from '../../application/interfaces/container-service.interface';
import { CONTAINER_SERVICE } from '../../application/interfaces/container-service.interface';
import { ContainerLogsDto } from '../dtos/container-logs.dto';

const logger = PinoLogger.child(
  { module: 'ContainerLogsGateway' },
  { msgPrefix: '[CONTAINER_LOGS_GATEWAY] - ' },
);

@WebSocketGateway({
  namespace: 'containers-live-logs',
  cors: {
    origin: '*',
  },
})
export class ContainerLogsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly subscribedContainers: Map<string, Set<string>> = new Map();
  private readonly streamClosers: Map<string, () => void> = new Map();

  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService,
    @Inject(CONTAINER_LOGS_SERVICE)
    private readonly containerLogsService: IContainerLogsService,
  ) {}

  handleConnection(client: Socket) {
    logger.info(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    logger.info(`Client disconnected: ${client.id}`);

    // Clean up subscriptions for this client
    this.subscribedContainers.forEach((clients, containerId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.subscribedContainers.delete(containerId);

        // Close any active streams
        if (this.streamClosers.has(`${containerId}-${client.id}`)) {
          const closeStream = this.streamClosers.get(`${containerId}-${client.id}`);
          closeStream?.();
          this.streamClosers.delete(`${containerId}-${client.id}`);
        }
      }
    });
  }

  @SubscribeMessage(SsmEvents.Logs.GET_LOGS)
  async handleGetLogs(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ContainerLogsDto,
  ): Promise<{ sessionId: string; success: boolean } | { success: false; message: string }> {
    logger.info(`Live logs request for container ${payload.containerId}`);

    try {
      // Validate payload
      if (!payload.containerId) {
        return { success: false, message: 'containerId is required' };
      }

      // Get container and check if it exists
      const container = await this.containerLogsService.findContainerById(payload.containerId);

      // Set up the from timestamp
      const from = payload.from || DateTime.now().toUnixInteger();
      logger.info(`Getting container (${container.id}) logs from ${from}`);

      // Set up the callback for sending logs
      const getContainerLogsCallback = (data: string) => {
        this.emit(SsmEvents.Logs.NEW_LOGS, { data });
      };

      // Get container logs
      const closingCallback = await this.containerLogsService.getContainerLiveLogs(
        container.id,
        from,
        getContainerLogsCallback,
      );

      // Store the stream closer function with a unique key
      const streamKey = `${container.id}-${client.id}`;
      this.streamClosers.set(streamKey, closingCallback);

      // Set up event listeners for closing the connection
      client.on(SsmEvents.Logs.CLOSED, () => {
        if (this.streamClosers.has(streamKey)) {
          const closer = this.streamClosers.get(streamKey);
          closer?.();
          this.streamClosers.delete(streamKey);
        }
      });

      client.on(SsmEvents.Common.DISCONNECT, () => {
        if (this.streamClosers.has(streamKey)) {
          const closer = this.streamClosers.get(streamKey);
          closer?.();
          this.streamClosers.delete(streamKey);
        }
      });

      // Send initial connection message
      getContainerLogsCallback(`🛜 Connecting...\n`);

      return { sessionId: streamKey, success: true };
    } catch (error: any) {
      logger.error(error, 'Error getting container logs');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: errorMessage };
    }
  }

  emit(event: string, data: any) {
    this.server.emit(event, data);
  }
}
