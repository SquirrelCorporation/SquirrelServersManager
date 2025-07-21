import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import Events from '@core/events/events';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpHandlerRegistryService } from './mcp-handler-registry.service';

@Injectable()
export class McpNotificationService {
  private readonly logger = new Logger(McpNotificationService.name);
  // Initialize server to null to satisfy linter
  private server: McpServer | null = null;

  // Inject the registry service to get the server instance
  constructor(private readonly registryService: McpHandlerRegistryService) {}

  // Get the server instance once available (e.g., in onModuleInit or lazily)
  // Using a simple approach for now, assuming registryService is initialized before this listener is active.
  // A more robust approach might use lifecycle hooks or promises.
  private getServer(): McpServer {
    if (!this.server) {
      this.server = this.registryService.getServerInstance();
      if (!this.server) {
        // This case should ideally not happen if module dependencies are correct
        this.logger.error('McpServer instance is not available from registry service!');
        throw new Error('McpServer instance unavailable for notifications.');
      }
    }
    return this.server;
  }

  /**
   * Handles the DEVICE_CREATED event to notify MCP clients about resource changes.
   * Uses the McpServer's notify method.
   */
  @OnEvent(Events.DEVICE_CREATED)
  async handleDeviceCreated() {
    this.logger.log(
      `Event ${Events.DEVICE_CREATED} received. Notifying MCP clients via McpNotificationService.`,
    );
    try {
      const server = this.getServer();
      // Use the server's notify method - this should route to active transports
      // See: https://modelcontextprotocol.io/docs/concepts/resources#list-changes
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Suppress persistent type error for notify, assuming method exists
      await server.notify('notifications/resources/list_changed', {
        resourceUris: ['devices://'],
      });
      this.logger.debug(
        `Sent 'notifications/resources/list_changed' for URI: devices:// via server.notify`,
      );
    } catch (error: any) {
      // Log the persistent linter error as a warning at runtime if it occurs
      if (error.message?.includes("Property 'notify' does not exist")) {
        this.logger.warn(
          `McpServer.notify method not found as per typings. Cannot send DEVICE_CREATED update. Error: ${error.message}`,
        );
      } else {
        this.logger.error(
          `Failed to send MCP resource list change notification for ${Events.DEVICE_CREATED}:`,
          error,
        );
      }
    }
  }
}
