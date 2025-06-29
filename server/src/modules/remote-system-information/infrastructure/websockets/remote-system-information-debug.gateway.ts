import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '@infrastructure/websocket-auth/ws-auth.guard';
import { SsmEvents } from 'ssm-shared-lib';
import { RemoteSystemInformationEngineService } from '../../application/services/engine/remote-system-information-engine.service';

@WebSocketGateway({
  namespace: '/remote-system-information-debug',
})
@UseGuards(WsAuthGuard)
@Injectable()
export class RemoteSystemInformationDebugGateway {
  private readonly logger = new Logger(RemoteSystemInformationDebugGateway.name);

  constructor(private readonly engineService: RemoteSystemInformationEngineService) {}

  @WebSocketServer()
  server!: Server;

  @SubscribeMessage(SsmEvents.RemoteSystemInfoDebug.DEBUG_COMPONENT)
  async debugComponent(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { deviceUuid: string; componentName: string },
    // Add callback function to support acknowledgments
    callback?: (response: any) => void,
  ): Promise<void> {
    try {
      this.logger.log(
        `[WebSocket] DEBUG_COMPONENT event received from client ${client.id}:`,
        payload,
      );
      this.logger.log(
        `Debug component request received: ${payload.deviceUuid} - ${payload.componentName}`,
      );

      // Validate payload
      if (!payload || !payload.deviceUuid || !payload.componentName) {
        const errorMsg = 'Invalid payload: deviceUuid and componentName are required';
        this.logger.error(errorMsg, payload);
        this.logger.error(`[WebSocket] Invalid payload:`, payload);

        // Send acknowledgment if callback exists
        if (typeof callback === 'function') {
          this.logger.log(`[WebSocket] Sending error acknowledgment`);
          callback({ success: false, error: errorMsg });
        }

        // Also emit error event
        client.emit(SsmEvents.RemoteSystemInfoDebug.DEBUG_ERROR, { error: errorMsg });
        return;
      }

      this.logger.log(`[WebSocket] Valid payload, proceeding to execute component`);

      // Send acknowledgment if callback exists
      if (typeof callback === 'function') {
        console.log(`[WebSocket] Sending success acknowledgment`);
        callback({ success: true, message: `Executing ${payload.componentName} component` });
      }

      // Send information message before execution starts
      client.emit(SsmEvents.RemoteSystemInfoDebug.DEBUG_COMMAND, {
        command: `Starting execution of ${payload.componentName} component...`,
        response: '',
        success: true,
      });

      // Execute the component in debug mode
      await this.engineService.executeComponentInDebugMode(
        payload.deviceUuid,
        payload.componentName,
        (command: string, response: string, success: boolean) => {
          this.logger.debug(`Emitting command result: ${command.substring(0, 30)}...`);
          this.logger.log(`[WebSocket] Emitting command to client ${client.id}:`, {
            command: command.substring(0, 30) + '...',
            responseLength: response?.length,
            success,
          });

          // Check if client is still connected
          if (client.connected) {
            client.emit(SsmEvents.RemoteSystemInfoDebug.DEBUG_COMMAND, {
              command,
              response,
              success,
            });
          } else {
            this.logger.error(
              `[WebSocket] Client ${client.id} is no longer connected, cannot emit command result`,
            );
          }
        },
      );

      this.logger.log(`Debug component execution completed`);
      this.logger.log(`[WebSocket] Debug component execution completed for client ${client.id}`);

      // Send completion message
      client.emit(SsmEvents.RemoteSystemInfoDebug.DEBUG_COMMAND, {
        command: `Execution of ${payload.componentName} component completed`,
        response: '',
        success: true,
      });
    } catch (error: any) {
      this.logger.error(`Error in debug component execution: ${error.message}`, error.stack);
      this.logger.error(`[WebSocket] Debug component error for client ${client.id}:`, error);

      // Send acknowledgment if callback exists
      if (typeof callback === 'function') {
        console.log(`[WebSocket] Sending error acknowledgment`);
        callback({ success: false, error: error.message });
      }

      // Also emit error event
      if (client.connected) {
        client.emit(SsmEvents.RemoteSystemInfoDebug.DEBUG_ERROR, { error: error.message });
      }
    }
  }
}
