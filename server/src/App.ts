import http from 'http';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import passport from 'passport';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { SECRET } from './config';
import { JwtAuthGuard } from './infrastructure/auth/strategies/jwt-auth.guard';
import { ApiExceptionFilter } from './infrastructure/filters/api-exception.filter';
import { ErrorTransformerInterceptor } from './infrastructure/interceptors/error-transformer.interceptor';
import { TransformInterceptor } from './infrastructure/interceptors/transform.interceptor';
import { AuditLogService } from './infrastructure/security/audit/audit-log.service';
import { AuditInterceptor } from './infrastructure/security/audit/audit.interceptor';
import logger from './logger';

// Declare global nestApp for legacy code to access
declare global {
  // eslint-disable-next-line no-var
  var nestApp: INestApplication | null;
}

const STATIC_CONFIG = {
  HTTP_PORT: 3000,
  CORE_SERVICE_PORT: 3002,
};

/*
 * This is a wrapper class for the NestJS application.
 */
class AppWrapper {
  private server!: http.Server;
  private nestApp!: INestApplication;

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

      // Set up Swagger documentation
      const config = new DocumentBuilder()
        .setTitle('Squirrel Servers Manager API')
        .setDescription('API documentation for Squirrel Servers Manager')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(nestApp, config);
      SwaggerModule.setup('docs', nestApp, document, {
        swaggerOptions: {
          persistAuthorization: true,
        },
      });
      logger.info('Swagger documentation initialized at /api/docs');

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

      // Start listening on HTTP port 3000
      await nestApp.listen(STATIC_CONFIG.HTTP_PORT);
      logger.info(`NestJS application listening on HTTP port ${STATIC_CONFIG.HTTP_PORT}`);

      // ---- Conditionally Start Internal Microservice Listener ---- Start ----

      nestApp.connectMicroservice<MicroserviceOptions>({
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: STATIC_CONFIG.CORE_SERVICE_PORT,
        },
      });
      // Start all configured microservices (including the TCP one)
      await nestApp.startAllMicroservices();
      logger.info(
        `Internal TCP Microservice listener connected on port ${STATIC_CONFIG.CORE_SERVICE_PORT} for MCP module communication`,
      );
      // ---- Conditionally Start Internal Microservice Listener ---- End ----

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

  public getApp() {
    return this.nestApp;
  }
}

export default new AppWrapper();
