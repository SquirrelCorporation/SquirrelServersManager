import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UsersService } from '@modules/users/application/services/users.service';
import { registerEchoHandler } from '../../infrastructure/handlers/echo.handler';
import { registerDeviceHandlers } from '../../infrastructure/handlers/device.handler';
import { registerContainerHandlers } from '../../infrastructure/handlers/container.handler';
import { registerStatsHandlers } from '../../infrastructure/handlers/stats.handler';
import { registerPlaybookHandlers } from '../../infrastructure/handlers/playbook.handler';

@Injectable()
export class McpHandlerRegistryService implements OnModuleInit {
  private readonly logger = new Logger(McpHandlerRegistryService.name);
  private readonly server: McpServer;

  constructor(
    // Inject dependencies needed by the handlers
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Optional() @Inject('CORE_SERVICE_CLIENT') private readonly coreServiceClient: ClientProxy,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    this.logger.log('Creating McpServer instance...');
    // Create the McpServer instance here
    this.server = new McpServer(
      {
        name: 'squirrel-servers-manager',
        version: '1.0.0', // Consider getting from package.json or config
      },
      {
        capabilities: {
          resources: {
            subscribe: true,
            notifyOnChange: true,
          },
          tools: {},
        },
      },
    );
  }

  onModuleInit() {
    // Register all handlers after dependencies are ready
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.logger.log('Registering MCP handlers...');

    // --- Echo Handler ---
    registerEchoHandler(this.server, this.logger);

    // Check coreServiceClient before registering handlers that depend on it
    if (!this.coreServiceClient) {
      this.logger.warn(
        'CORE_SERVICE_CLIENT not available. Skipping registration of handlers requiring core communication (Device, Container, Stats, Playbook).',
      );
      // Optionally register fallback/error handlers if needed
    } else {
      // --- Device Handlers (Resources) ---
      registerDeviceHandlers({
        server: this.server,
        coreServiceClient: this.coreServiceClient,
        logger: this.logger,
      });

      // --- Container Handlers (Tools) ---
      registerContainerHandlers({
        server: this.server,
        coreServiceClient: this.coreServiceClient,
        logger: this.logger,
      });

      // --- Stats Handlers (Tools) ---
      registerStatsHandlers({
        server: this.server,
        coreServiceClient: this.coreServiceClient,
        logger: this.logger,
      });

      // --- Playbook Handlers (Tools) ---
      registerPlaybookHandlers({
        server: this.server,
        coreServiceClient: this.coreServiceClient,
        cacheManager: this.cacheManager,
        usersService: this.usersService,
        logger: this.logger,
      });
    }

    this.logger.log('All MCP handlers registration initiated.');
  }

  /**
   * Provides access to the configured McpServer instance.
   * @returns The McpServer instance.
   */
  getServerInstance(): McpServer {
    return this.server;
  }
}
