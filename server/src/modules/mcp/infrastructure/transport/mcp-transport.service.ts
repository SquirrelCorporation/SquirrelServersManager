import { randomUUID } from 'crypto';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { RequestHandler } from 'express';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { UsersService } from '@modules/users/application/services/users.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { McpHandlerRegistryService } from '../../application/services/mcp-handler-registry.service';
import { MCP_ENABLED_CACHE_KEY } from '../../application/constants/mcp.constants';

const MCP_PORT = 3001;

@Injectable()
export class McpTransportService implements OnModuleInit {
  private readonly logger = new Logger(McpTransportService.name);
  private readonly app = express();
  private server: McpServer | null = null;
  private readonly transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    private readonly registryService: McpHandlerRegistryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.app.use(express.json());
  }

  private async authenticate(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    this.logger.debug('MCP Auth Headers: ' + JSON.stringify(req.headers, null, 2));
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('MCP Auth Failed: Missing or malformed Authorization header');
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid API key' });
    }
    const apiKey = authHeader.split(' ')[1];
    try {
      const user = await this.usersService.findUserByApiKey(apiKey);
      if (!user) {
        this.logger.warn(`MCP Auth Failed: Invalid API key provided: ${apiKey.substring(0, 5)}...`);
        return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
      }
      (req as any).user = user;
      this.logger.debug(`MCP Auth Success: User ${user.email} authenticated via API key.`);
      next();
    } catch (error) {
      this.logger.error('MCP Auth Error:', error);
      return res.status(500).json({ message: 'Internal Server Error during authentication' });
    }
  }

  async onModuleInit() {
    const mcpEnabled = await this.cacheManager.get<boolean>(MCP_ENABLED_CACHE_KEY);
    if (mcpEnabled) {
      this.logger.log('MCP is enabled in cache, attempting to start server...');
      await this.startServer();
    } else {
      this.logger.warn('MCP is disabled via settings cache. Skipping MCP server setup.');
      return;
    }
  }

  private async startServer() {
    this.server = this.registryService.getServerInstance();
    if (!this.server) {
      this.logger.error(
        'Failed to get McpServer instance from registry. MCP transport cannot start.',
      );
      throw new Error('McpServer instance is unavailable.');
    }
    this.logger.log('Successfully obtained McpServer instance from registry.');

    this.app.use('/', ((req, res, next) => this.authenticate(req, res, next)) as RequestHandler);

    this.app.post('/', async (req, res) => {
      this.logger.debug(
        `>>> MCP Request received: ${req.method} ${req.path} ${JSON.stringify(req.body)}`,
      );
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport | undefined = sessionId
        ? this.transports[sessionId]
        : undefined;

      if (transport) {
        this.logger.debug(`Reusing existing MCP transport for session: ${sessionId}`);
      } else if (!sessionId && isInitializeRequest(req.body)) {
        this.logger.log('Creating new MCP transport for initialization request.');
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            this.logger.log(`MCP Session Initialized: ${newSessionId}`);
            if (transport) {
              this.transports[newSessionId] = transport;
            } else {
              this.logger.error('Transport became undefined during onsessioninitialized callback');
            }
          },
        });

        transport.onclose = () => {
          if (transport?.sessionId && this.transports[transport.sessionId]) {
            this.logger.log(`MCP Session Closed: ${transport.sessionId}`);
            delete this.transports[transport.sessionId];
          }
        };

        if (this.server) {
          await this.server.connect(transport);
        } else {
          this.logger.error('Cannot connect transport, McpServer instance is null.');
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Internal Server Error: MCP Server not initialized.',
            },
            id: (req.body as any)?.id ?? null,
          });
          return;
        }
      } else {
        this.logger.warn(
          `Bad MCP Request: No valid session ID (${sessionId}) or not an init request.`,
        );
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Bad Request: No valid session ID provided or invalid request type.',
          },
          id: (req.body as any)?.id ?? null,
        });
        return;
      }

      if (transport) {
        await transport.handleRequest(req, res, req.body);
      } else {
        this.logger.error('Transport is undefined after initialization/lookup logic.');
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Internal Server Error: Transport unavailable.' },
          id: (req.body as any)?.id ?? null,
        });
      }
    });

    const handleSessionRequest = async (req: express.Request, res: express.Response) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (!sessionId || !this.transports[sessionId]) {
        this.logger.warn(
          `Invalid or missing MCP session ID for ${req.method} request: ${sessionId}`,
        );
        res.status(400).send('Invalid or missing session ID');
        return;
      }
      const transport = this.transports[sessionId];
      this.logger.debug(`Handling ${req.method} MCP request for session: ${sessionId}`);
      await transport.handleRequest(req, res);
    };

    this.app.get('/', handleSessionRequest);

    this.app.delete('/', handleSessionRequest);

    try {
      this.app.listen(MCP_PORT, () => {
        this.logger.log(`MCP HTTP server listening for client connections on port ${MCP_PORT}`);
      });
    } catch (error) {
      this.logger.error('Failed to start MCP HTTP server:', error);
      throw error;
    }
  }
}
