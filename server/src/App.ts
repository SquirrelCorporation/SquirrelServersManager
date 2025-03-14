import http from 'http';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { pinoHttp } from 'pino-http';
import { AppModule } from './app.module';
import { SECRET } from './config';
import metrics from './controllers/rest/metrics/metrics';
import EventManager from './core/events/EventManager';
import Events from './core/events/events';
import { HttpExceptionFilter } from './infrastructure/filters/http-exception.filter';
import { TransformInterceptor } from './infrastructure/interceptors/transform.interceptor';
import logger, { httpLoggerOptions } from './logger';
import { errorHandler } from './middlewares/ErrorHandler';
import RealTime from './modules/real-time/RealTime';

// Declare global nestApp for legacy code to access
declare global {
  var nestApp: INestApplication | null;
}

class AppWrapper extends EventManager {
  private server!: http.Server;
  private readonly refs: any = [];
  private nestApp!: INestApplication;

  constructor() {
    super();
    this.refs.push(RealTime);
    this.setup();
  }

  public setup() {
/*    this.expressApp.use(
      pinoHttp({
        logger: logger.child(
          { module: 'REST' },
          { msgPrefix: '[REST] - ', redact: ['req.headers.authorization'] },
        ),
        ...httpLoggerOptions,
      }),
    );
    */
   // this.expressApp.use(express.json({ limit: '50mb' }));
    if (!SECRET) {
      throw new Error('No secret defined');
    }

  }

  public async setupNestJS(): Promise<INestApplication> {
    try {
      logger.info('Setting up NestJS application');

      // Set up Express routes BEFORE creating the NestJS app
      this.setupRoutes();

      // Create NestJS app with Express adapter using our existing Express app
      const nestApp = await NestFactory.create<NestExpressApplication>(AppModule);

      nestApp.listen(3000);
      nestApp.use(cookieParser());
      nestApp.use(passport.initialize());
      // Make the nestApp available globally for legacy code
      globalThis.nestApp = nestApp;

      // Set up global validation pipe
      nestApp.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        })
      );
      // Apply global interceptor for standardized response format
      nestApp.useGlobalInterceptors(new TransformInterceptor());

      // Apply global exception filter
      nestApp.useGlobalFilters(new HttpExceptionFilter());

      // Log that we're initializing NestJS
      logger.info('Initializing NestJS application with WebSocket gateways');

      // We'll set up the WebSocket adapter when we start the server
      // This ensures the HTTP server is already created

      logger.info('Initializing NestJS application - this will create all modules/providers');
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
      throw new Error(`Failed to initialize NestJS application: ${errorMessage}`);
    }
  }

  public setupRoutes() {
    logger.info('\n\nSetting up routes ==========================================');
    // These routes will be handled by Express
   // this.expressApp.use(metrics);
   // this.expressApp.use(errorHandler);
  }

  public async startServer() {
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
   // return this.expressApp;
  }
}

export default new AppWrapper();
