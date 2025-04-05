import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import http from 'http';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import passport from 'passport';
import { AppModule } from './app.module';
import { SECRET } from './config';
import { ApiExceptionFilter } from './infrastructure/filters/api-exception.filter';
import { ErrorTransformerInterceptor } from './infrastructure/interceptors/error-transformer.interceptor';
import { TransformInterceptor } from './infrastructure/interceptors/transform.interceptor';
import { AuditLogService } from './infrastructure/security/audit/audit-log.service';
import { AuditInterceptor } from './infrastructure/security/audit/audit.interceptor';
import logger from './logger';
import { JwtAuthGuard } from './modules/auth/strategies/jwt-auth.guard';

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

      // Apply Helmet security headers
      nestApp.use(
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              mediaSrc: ["'self'"],
              frameSrc: ["'none'"],
            },
          },
          xssFilter: true,
          noSniff: true,
          ieNoOpen: true,
          referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
          hsts: {
            maxAge: 15552000, // 180 days
            includeSubDomains: true,
          },
        }),
      );
      logger.info('Applied Helmet security headers');

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
      // Apply global interceptors for standardized response format
      const reflector = nestApp.get(Reflector);

      // Get the AuditLogService from the DI container
      const auditLogService = nestApp.get(AuditLogService);

      nestApp.useGlobalInterceptors(
        new TransformInterceptor(),
        new LoggerErrorInterceptor(),
        new ErrorTransformerInterceptor(),
        new AuditInterceptor(auditLogService, reflector),
      );

      // Apply global exception filter that handles both HttpExceptions and legacy ApiErrors
      nestApp.useGlobalFilters(new ApiExceptionFilter());

      // Apply global authentication guard to protect all endpoints by default
      // Using the reflector that was already defined above

      // Apply JWT authentication guard globally
      nestApp.useGlobalGuards(new JwtAuthGuard(reflector));

      logger.info(
        'Global authentication and authorization guards applied - use @Public() to exclude authentication',
      );

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
