import { randomUUID } from 'crypto';
import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '@modules/users/application/services/users.service';
import { Cache } from '@nestjs/cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class McpTransportService implements OnModuleInit {
  private readonly logger = new Logger(McpTransportService.name);
  private readonly app = express();
  private readonly server: McpServer;
  private readonly transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Optional()
    @Inject('CORE_SERVICE_CLIENT')
    private readonly coreServiceClient: ClientProxy,
    @Inject()
    private readonly usersService: UsersService,
  ) {
    this.app.use(express.json());
    this.server = new McpServer(
      {
        name: 'squirrel-servers-manager',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      },
    );
  }

  async onModuleInit() {
    const mcpEnabled = await this.cacheManager.get<boolean>('mcp.enabled');
    if (!mcpEnabled) {
      this.logger.warn('MCP is disabled via settings cache');
      return;
    } else {
      this.logger.log('MCP is enabled via settings cache');
    }

    // Register tools dynamically based on available services
    this.registerTools();

    // Handle POST requests for client-to-server communication
    this.app.post('/', async (req, res) => {
      this.logger.debug(
        `>>> Request received: ${req.method} ${req.path} ${JSON.stringify(req.body)}`,
      );
      // Check for existing session ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && this.transports[sessionId]) {
        // Reuse existing transport
        transport = this.transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            this.transports[sessionId] = transport;
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            delete this.transports[transport.sessionId];
          }
        };

        // Connect to the MCP server
        await this.server.connect(transport);
      } else {
        // Invalid request
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        return;
      }

      // Handle the request
      await transport.handleRequest(req, res, req.body);
    });

    // Reusable handler for GET and DELETE requests
    const handleSessionRequest = async (req: express.Request, res: express.Response) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (!sessionId || !this.transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }

      const transport = this.transports[sessionId];
      await transport.handleRequest(req, res);
    };

    // Handle GET requests for server-to-client notifications via SSE
    this.app.get('/', handleSessionRequest);

    // Handle DELETE requests for session termination
    this.app.delete('/', handleSessionRequest);
    try {
      const mcpPort = this.configService.get<number>('MCP_PORT', 3001);
      this.app.listen(mcpPort, () => {
        this.logger.log(`MCP HTTP server listening for client connections on port ${mcpPort}`);
      });
    } catch (error) {
      this.logger.error('Failed to start MCP HTTP server:', error);
      throw error;
    }
  }

  // New method to register tools
  private registerTools(): void {
    this.logger.debug('Registering MCP tools...');

    // --- Echo Tool (Corrected Signature) ---
    this.server.tool(
      'echo',
      { message: z.string().describe('Message to echo back') },
      async (params) => {
        return { content: [{ type: 'text', text: params.message }] };
      },
    );

    // Check coreServiceClient
    if (!this.coreServiceClient) {
      this.logger.warn(
        'CORE_SERVICE_CLIENT not available. Skipping registration of Device, Container, Stats, and Playbook tools requiring core communication.',
      );
      return;
    }

    // --- Device Resources (list and get) ---
    // List all devices at devices://
    this.server.resource('devices', 'devices://', async (uri) => {
      this.logger.debug('Listing all devices');
      const devices = await firstValueFrom(
        this.coreServiceClient.send({ cmd: 'core_find_all_devices' }, {}),
      );
      this.logger.debug(JSON.stringify(devices, null, 2));
      return {
        contents: [
          { uri: uri.href, mimeType: 'application/json', text: JSON.stringify(devices, null, 2) },
        ],
      };
    });
    // Get individual device by UUID at devices://{uuid}
    this.server.resource(
      'device',
      new ResourceTemplate('devices://{uuid}', { list: undefined }),
      async (uri, { uuid }) => {
        const device = await firstValueFrom(
          this.coreServiceClient.send({ cmd: 'core_find_device_by_uuid' }, { deviceUuid: uuid }),
        );
        return {
          contents: [
            { uri: uri.href, mimeType: 'application/json', text: JSON.stringify(device, null, 2) },
          ],
        };
      },
    );

    // --- ContainerService Tools ---
    this.server.tool('findAllContainers', 'Get a list of running containers', async () => {
      const containers = await firstValueFrom(
        this.coreServiceClient.send({ cmd: 'core_find_all_containers' }, {}),
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(containers, null, 2) }],
      };
    });
    this.server.tool(
      'findContainerById',
      { containerId: z.string().describe('ID of the container to find') },
      async (params) => {
        const container = await firstValueFrom(
          this.coreServiceClient.send({ cmd: 'core_find_container_by_id' }, params),
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(container, null, 2) }],
        };
      },
    );

    // --- StatsService Tools ---
    this.server.tool(
      'getTimeseriesStats',
      {
        metric: z.string().describe('The metric to query (e.g., cpu_usage)'),
        deviceId: z.string().uuid().optional().describe('Optional device UUID filter'),
        containerId: z.string().optional().describe('Optional container ID filter'),
        start: z.string().datetime().optional().describe('Optional start time (ISO 8601)'),
        end: z.string().datetime().optional().describe('Optional end time (ISO 8601)'),
        step: z.string().optional().describe('Optional query step (e.g., 1m, 1h)'),
      },
      async (params) => {
        const stats = await firstValueFrom(
          this.coreServiceClient.send({ cmd: 'core_get_timeseries_stats' }, params),
        );
        return {
          content: [{ type: 'text', text: `System Stats:\n${JSON.stringify(stats, null, 2)}` }],
        };
      },
    );

    // Get Playbook Status Tool
    this.server.tool(
      'getPlaybookExecutionStatus',
      {
        execId: z.string().describe('ID of the playbook execution job'),
      },
      async (params) => {
        const status = await firstValueFrom(
          this.coreServiceClient.send({ cmd: 'core_get_playbook_status' }, params),
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      },
    );
    this.logger.log('Registering PlaybookService tools via CORE_SERVICE_CLIENT');
    // Execute Playbook Tool
    this.server.tool(
      'executePlaybook',
      {
        playbookUuid: z.string().uuid().optional().describe('UUID of the playbook'),
        playbookQuickRef: z.string().optional().describe('Quick reference of the playbook'),
        target: z
          .array(z.string())
          .optional()
          .describe('Target host or group for execution (Device UUIDs)'),
      },
      async (params) => {
        this.logger.log(`Received executePlaybook request with payload: ${JSON.stringify(params)}`);
        const user = await this.usersService.getFirstUser();
        const result = await firstValueFrom(
          this.coreServiceClient.send({ cmd: 'core_execute_playbook' }, { ...params, user }),
        );
        this.logger.log(`${JSON.stringify(result, null, 2)}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ execId: result }),
            },
          ],
        };
      },
    );
  }

  getServer(): McpServer {
    return this.server;
  }
}
