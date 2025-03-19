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
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { SsmEvents } from 'ssm-shared-lib';
import { DateTime } from 'luxon';
import { JwtAuthGuard } from '../../../auth/strategies/jwt-auth.guard';
import { CONTAINER_LOGS_SERVICE, IContainerLogsService } from '../../application/interfaces/container-logs-service.interface';
import PinoLogger from '../../../../logger';
import { ContainerServiceInterface } from '../../application/interfaces/container-service.interface';
import { CONTAINER_SERVICE } from '../../application/interfaces/container-service.interface';
import { ContainerLogsDto } from '../dtos/container-logs.dto';

const logger = PinoLogger.child({ module: 'ContainerLogsGateway' }, { msgPrefix: '[CONTAINER_LOGS_GATEWAY] - ' });

@WebSocketGateway({
  namespace: 'container-logs',
  cors: {
    origin: '*',
  },
})
export class ContainerLogsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly subscribedContainers: Map<string, Set<string>> = new Map();
  private readonly streamClosers: Map<string, () => void> = new Map();

  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: ContainerServiceInterface,
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

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { containerId: string; tail?: number },
  ) {
    try {
      const { containerId, tail = 100 } = data;

      logger.info(`Client ${client.id} subscribing to container ${containerId}`);

      // Find the container
      const container = await this.containerService.getContainerByUuid(containerId);
      if (!container) {
        client.emit('error', { message: `Container ${containerId} not found` });
        return;
      }

      // Add client to subscribers
      if (!this.subscribedContainers.has(containerId)) {
        this.subscribedContainers.set(containerId, new Set());
      }
      this.subscribedContainers?.get(containerId)?.add(client.id);

      // Fetch initial logs
      const initialLogs = await this.containerLogsService.getContainerLogs(containerId, { tail });
      client.emit('logs', { containerId, logs: initialLogs });

      // Start streaming logs
      try {
        const onData = (logs: string) => {
          client.emit('logs', { containerId, logs });
        };

        const onError = (error: Error) => {
          logger.error(`Error in log stream for container ${containerId}: ${error.message}`);
          client.emit('error', { message: error.message });
        };

        const closeStream = await this.containerLogsService.streamContainerLogs(
          containerId,
          onData,
          onError,
          { tail }
        );

        // Store the stream closer function
        this.streamClosers.set(`${containerId}-${client.id}`, closeStream);

        // Set up client disconnection handler
        client.once('disconnect', () => {
          if (this.streamClosers.has(`${containerId}-${client.id}`)) {
            const closer = this.streamClosers.get(`${containerId}-${client.id}`);
            closer?.();
            this.streamClosers.delete(`${containerId}-${client.id}`);
          }
        });
      } catch (error: any) {
        logger.error(`Failed to stream logs for container ${containerId}: ${error.message}`);
        client.emit('error', { message: `Failed to stream logs: ${error.message}` });
      }
    } catch (error: any) {
      logger.error(`Error in handleSubscribe: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { containerId: string },
  ) {
    const { containerId } = data;
    logger.info(`Client ${client.id} unsubscribing from container ${containerId}`);

    // Close stream if active
    if (this.streamClosers.has(`${containerId}-${client.id}`)) {
      const closeStream = this.streamClosers.get(`${containerId}-${client.id}`);
      closeStream?.();
      this.streamClosers.delete(`${containerId}-${client.id}`);
    }

    // Remove from subscribers list
    if (this.subscribedContainers.has(containerId)) {
      this.subscribedContainers?.get(containerId)?.delete(client.id);
      if (this.subscribedContainers?.get(containerId)?.size === 0) {
        this.subscribedContainers?.delete(containerId);
      }
    }
  }

  // Support for legacy event
  @SubscribeMessage(SsmEvents.Logs.GET_LOGS)
  async handleGetLogs(
    @MessageBody() payload: ContainerLogsDto,
    @ConnectedSocket() client: Socket,
  ) {
    logger.info(`Legacy log request for container ${payload.containerId}`);

    try {
      // Validate payload
      if (!payload.containerId) {
        return { event: SsmEvents.Logs.GET_LOGS, data: { status: 'Bad Request', error: 'containerId is required' } };
      }

      // Get container and check if it exists
      const container = await this.containerLogsService.findContainerById(payload.containerId);

      // Set up the from timestamp
      const from = payload.from || DateTime.now().toUnixInteger();
      logger.info(`Getting container (${container.id}) logs from ${from}`);

      // Set up the callback for sending logs
      const getContainerLogsCallback = (data: string) => {
        client.emit(SsmEvents.Logs.NEW_LOGS, { data });
      };

      // Set up error handler
      const errorHandler = (error: Error) => {
        logger.error('Error in log stream', error);
        client.emit(SsmEvents.Logs.NEW_LOGS, { data: `🔴 Error: ${error.message}` });
      };

      // Get container logs
      const closingCallback = await this.containerLogsService.streamContainerLogs(
        container.id,
        getContainerLogsCallback,
        errorHandler,
        { from }
      );

      // Store the stream closer function with a unique key
      const streamKey = `legacy-${container.uuid}-${client.id}`;
      this.streamClosers.set(streamKey, closingCallback);

      // Set up event listeners for closing the connection
      client.on(SsmEvents.Logs.CLOSED, () => {
        if (this.streamClosers.has(streamKey)) {
          const closer = this.streamClosers.get(streamKey);
          closer();
          this.streamClosers.delete(streamKey);
        }
      });

      client.on(SsmEvents.Common.DISCONNECT, () => {
        if (this.streamClosers.has(streamKey)) {
          const closer = this.streamClosers.get(streamKey);
          closer();
          this.streamClosers.delete(streamKey);
        }
      });

      // Send initial connection message
      getContainerLogsCallback(`🛜 Connecting...\n`);

      return { event: SsmEvents.Logs.GET_LOGS, data: { status: 'OK' } };
    } catch (error: unknown) {
      logger.error('Error getting container logs', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        event: SsmEvents.Logs.GET_LOGS,
        data: { status: 'Internal Error', error: errorMessage },
      };
    }
  }
}