import http from 'http';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppModule } from './app.module';
import { SECRET } from './config';
import { HttpExceptionFilter } from './infrastructure/filters/http-exception.filter';
import { TransformInterceptor } from './infrastructure/interceptors/transform.interceptor';
import logger from './logger';
import RealTime from './modules/real-time/RealTime';

// Declare global nestApp for legacy code to access
declare global {
  // eslint-disable-next-line no-var
  var nestApp: INestApplication | null;
}

class AppWrapper {
  private server!: http.Server;
  private readonly refs: any = [];
  private nestApp!: INestApplication;
  private readonly logger = logger;

  constructor() {
    this.refs.push(RealTime);
    this.setup();
  }

  public setup() {
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
      const nestApp = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: true,
      });
      nestApp.useLogger(nestApp.get(Logger));

      // Enable CORS
      nestApp.enableCors();

      // Configure the app
      nestApp.use(cookieParser());
      nestApp.use(passport.initialize());

      // Make the nestApp available globally for legacy code
      globalThis.nestApp = nestApp;

      // Set up global validation pipe
      nestApp.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: false,
          forbidUnknownValues: false,
        }),
      );
      // Apply global interceptor for standardized response format
      nestApp.useGlobalInterceptors(new TransformInterceptor(), new LoggerErrorInterceptor());

      // Apply global exception filter
      nestApp.useGlobalFilters(new HttpExceptionFilter());

      // Log that we're initializing NestJS
      logger.info('Initializing NestJS application with WebSocket gateways');

      // Initialize plugin system if available
      try {
        const pluginSystem = nestApp.get('PLUGIN_SYSTEM', { strict: false });
        if (pluginSystem) {
          logger.info('Initializing plugin system');

          // Add debug logging for the NestJS app
          logger.info(`NestJS app type: ${typeof nestApp}`);
          logger.info(
            `NestJS app methods: ${Object.keys(nestApp)
              .filter((key) => typeof nestApp[key] === 'function')
              .join(', ')}`,
          );

          const httpAdapter = nestApp.getHttpAdapter();
          logger.info(`HTTP adapter type: ${typeof httpAdapter}`);
          logger.info(
            `HTTP adapter methods: ${Object.keys(httpAdapter)
              .filter((key) => typeof httpAdapter[key] === 'function')
              .join(', ')}`,
          );

          await pluginSystem.initializePlugins(nestApp);
          logger.info('Plugin system initialized');
        }
      } catch (error) {
        logger.warn('Plugin system not available or failed to initialize', error);
      }

      // Initialize the application
      logger.info('Initializing NestJS application - this will create all modules/providers');
      await nestApp.init();
      this.nestApp = nestApp;

      // Start listening on port 3000
      await nestApp.listen(3000);
      logger.info('NestJS application listening on port 3000');

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
  }

  public async startServer() {}

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
    // Return the express app if needed
  }
}

export default new AppWrapper();
