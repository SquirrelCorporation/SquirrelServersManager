import http from 'http';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import cookieParser from 'cookie-parser';
import express from 'express';
import passport from 'passport';
import { pinoHttp } from 'pino-http';
import { Server as SocketIOServer } from 'socket.io';
import { AppModule } from './app.module';
import { SECRET } from './config';
import metrics from './controllers/rest/metrics/metrics';
import EventManager from './core/events/EventManager';
import Events from './core/events/events';
import logger, { httpLoggerOptions } from './logger';
import { errorHandler } from './middlewares/ErrorHandler';
import RealTime from './modules/real-time/RealTime';

// Declare global nestApp for legacy code to access
declare global {
  var nestApp: INestApplication | null;
}

interface RouteInfo {
  path: string;
  methods: string;
}

class AppWrapper extends EventManager {
  protected readonly expressApp = express();
  private server!: http.Server;
  private readonly refs: any = [];
  private nestApp!: INestApplication;

  constructor() {
    super();
    this.refs.push(RealTime);
    this.setup();
  }

  public setup() {
    this.expressApp.use(
      pinoHttp({
        logger: logger.child(
          { module: 'REST' },
          { msgPrefix: '[REST] - ', redact: ['req.headers.authorization'] },
        ),
        ...httpLoggerOptions,
      }),
    );
    this.expressApp.use(express.json({ limit: '50mb' }));
    if (!SECRET) {
      throw new Error('No secret defined');
    }
    this.expressApp.use(cookieParser());
    this.expressApp.use(passport.initialize());
  }

  public async setupNestJS(): Promise<INestApplication> {
    try {
      logger.info('Setting up NestJS application');

      // Set up Express routes BEFORE creating the NestJS app
      this.setupRoutes();

      // Create NestJS app with Express adapter using our existing Express app
      const adapter = new ExpressAdapter(this.expressApp);
      const nestApp = await NestFactory.create(AppModule, adapter, {
        logger: ['error', 'warn', 'log', 'debug'],
      });

      // Make the nestApp available globally for legacy code
      global.nestApp = nestApp;

      // Set up global validation pipe
      nestApp.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        })
      );

      // Log that we're initializing NestJS
      logger.info('Initializing NestJS application with WebSocket gateways');

      // We'll set up the WebSocket adapter when we start the server
      // This ensures the HTTP server is already created

      await nestApp.init();
      this.nestApp = nestApp;

      logger.info('NestJS application initialized successfully');

      return nestApp;
    } catch (error) {
      // Improved error handling to avoid undefined stack properties
      const errorMessage =
        error instanceof Error
          ? `${error.message}${error.stack ? `\n${error.stack}` : ''}`
          : String(error);

      logger.error(`Failed to initialize NestJS application: ${errorMessage}`);
      return null;
    }
  }

  public setupRoutes() {
    logger.info('\n\nSetting up routes ==========================================');
    // These routes will be handled by Express
    this.expressApp.use(metrics);
    this.expressApp.use(errorHandler);

    // Log all registered routes for debugging
    const registeredRoutes: RouteInfo[] = [];

    // Type assertion to access the internal _router property
    const expressRouter = (this.expressApp as any)._router;

    if (expressRouter && expressRouter.stack) {
      expressRouter.stack.forEach((middleware: any) => {
        if (middleware.route) {
          // Routes registered directly on the app
          registeredRoutes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods).join(','),
          });
        } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
          // Router middleware
          middleware.handle.stack.forEach((handler: any) => {
            if (handler.route) {
              registeredRoutes.push({
                path: handler.route.path,
                methods: Object.keys(handler.route.methods).join(','),
              });
            }
          });
        }
      });
    }

    logger.info(`Registered Express routes: ${JSON.stringify(registeredRoutes, null, 2)}`);
  }

  public async startServer() {
    this.server = this.expressApp.listen(3000, () =>
      logger.info(`
    🐿 Squirrel Servers Manager
    🚀 Server ready at: http://localhost:3000`),
    );

    // Set up Socket.IO server for WebSocket communication
    try {
      logger.info('Setting up Socket.IO server for WebSocket communication');

      // Create a custom IoAdapter that uses our existing HTTP server
      class CustomIoAdapter extends IoAdapter {
        public server;
        constructor(app: INestApplication, server) {
          super(app);
          this.server = server;
        }

        createIOServer(port: number, options?: any): any {
          // Configure Socket.IO options
          const socketOptions = {
            ...options,
            cors: {
              origin: '*',
              methods: ['GET', 'POST'],
            },
            allowEIO3: true, // Allow Engine.IO v3 clients
            transports: ['websocket', 'polling'], // Enable both WebSocket and HTTP polling
          };

          logger.info(`Setting up Socket.IO server with options: ${JSON.stringify(socketOptions)}`);

          // Create the Socket.IO server using the existing HTTP server
          const io = new SocketIOServer(this.server, socketOptions);

          // Store the Socket.IO server instance for potential future use
          (global as any).io = io;

          return io;
        }

        // Override to use our existing HTTP server
        get httpServer() {
          return this.server;
        }
      }

      // Create an instance of our custom adapter
      const customAdapter = new CustomIoAdapter(this.nestApp, this.server);

      // Set the HTTP server for the adapter
      (customAdapter as any).server = this.server;

      // Apply the custom adapter to the NestJS app
      logger.info('Applying custom WebSocket adapter to NestJS app');
      this.nestApp.useWebSocketAdapter(customAdapter);

      logger.info('Socket.IO server initialized successfully');
      logger.info('Socket.IO server is now listening for connections');
    } catch (error: any) {
      logger.error(`Failed to set up Socket.IO server: ${error.message}`);
      logger.error((error as Error).stack);
    }

    logger.info('Server started with Socket.IO server for WebSocket communication');

    this.emit(Events.APP_STARTED, 'App started');
  }

  public async stopServer(callback: () => any) {
    // Close NestJS app
    if (this.nestApp) {
      try {
        await this.nestApp.close();
      } catch (error) {
        logger.error(`Error closing NestJS app: ${error}`);
      }
    }

    this.server?.close(() => {
      logger.info('Server is closed');
      logger.info('\n----------------- restarting -------------');
      callback();
    });
  }

  public getExpressApp() {
    return this.expressApp;
  }
}

export default new AppWrapper();
