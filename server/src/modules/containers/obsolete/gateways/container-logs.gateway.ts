/**
 * @deprecated This gateway is deprecated and will be removed in a future version.
 * Please use the new ContainerLogsGateway in presentation/gateways/container-logs.gateway.ts
 */

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { SsmEvents } from 'ssm-shared-lib';
import { DateTime } from 'luxon';
import { ContainerLogsDto } from '../dto/container-logs.dto';
import { ContainerLogsService } from '../services/container-logs.service';
import { IContainerLogsService, CONTAINER_LOGS_SERVICE } from '../application/interfaces/container-logs-service.interface';

@WebSocketGateway({
  namespace: '/containers',
  cors: {
    origin: '*',
  },
})
export class ContainerLogsGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ContainerLogsGateway.name);

  constructor(
    private readonly containerLogsService: ContainerLogsService,
    @Inject(CONTAINER_LOGS_SERVICE)
    private readonly newContainerLogsService: IContainerLogsService
  ) {}

  @SubscribeMessage(SsmEvents.Logs.GET_LOGS)
  async handleGetLogs(
    @MessageBody() payload: ContainerLogsDto,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<{ status: string; error?: string }>> {
    this.logger.log('getContainerLogs');
    this.logger.warn('This endpoint is deprecated. Please use the new container-logs namespace.');

    try {
      // Validate payload
      if (!payload.containerId) {
        return { event: SsmEvents.Logs.GET_LOGS, data: { status: 'Bad Request', error: 'containerId is required' } };
      }

      // Get container and check if it exists
      const container = await this.newContainerLogsService.findContainerById(payload.containerId);

      // Set up the from timestamp
      const from = payload.from || DateTime.now().toUnixInteger();
      this.logger.log(`Getting container (${container.id}) logs from ${from}`);

      // Set up the callback for sending logs
      const getContainerLogsCallback = (data: string) => {
        client.emit(SsmEvents.Logs.NEW_LOGS, { data });
      };

      // Set up error handler
      const errorHandler = (error: Error) => {
        this.logger.error('Error in log stream', error);
        client.emit(SsmEvents.Logs.NEW_LOGS, { data: `🔴 Error: ${error.message}` });
      };

      // Get container logs using the new service
      const closingCallback = await this.newContainerLogsService.streamContainerLogs(
        container.uuid,
        getContainerLogsCallback,
        errorHandler,
        { from }
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