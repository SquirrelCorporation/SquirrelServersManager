import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import mongoose from 'mongoose';
import { LoggerModule } from 'nestjs-pino';
import { SshModule } from '@modules/ssh';
import { db } from './config';
import logger, { httpLoggerOptions } from './logger';
import { AnsibleConfigModule } from './modules/ansible-config/ansible-config.module';
import { AnsibleModule } from './modules/ansible/ansible.module';
import { AnsibleVaultModule } from './modules/ansible-vault/ansible-vault.module';
import { AuthModule } from './modules/auth/auth.module';
//import { AutomationsModule } from './modules/automations/automations.module';
import { ContainerStacksModule } from './modules/container-stacks/container-stacks.module';
//import { ContainersModule } from './modules/containers/containers.module';
import { DevicesModule } from './modules/devices/devices.module';
import { DiagnosticModule } from './modules/diagnostic/diagnostic.module';
import { LogsModule } from './modules/logs/logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PlaybooksModule } from './modules/playbooks/playbooks.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SftpModule } from './modules/sftp/sftp.module';
import { ShellModule } from './modules/shell/shell.module';
import { SmartFailureModule } from './modules/smart-failure/smart-failure.module';
import { UpdateModule } from './modules/update/update.module';
import { UsersModule } from './modules/users/users.module';
import { CacheModule } from './infrastructure/cache';
import { SshInfrastructureModule } from './infrastructure/ssh/ssh-infrastructure.module';
import { HealthModule } from './modules/health/health.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

// Store the connection for legacy code to access
let sharedConnection: mongoose.Connection | null = null;
let connectionReady = false;

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {...httpLoggerOptions, transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: {
                colorize: true,
              },
            },
            {
              target: 'pino-mongodb',
      options: {
        uri: `mongodb://${db.host}:${db.port}/`,
        database: `${db.name}`,
        collection: 'logs',
      },
    },
          ],
        },
    }
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot({
      // Set graceful shutdown to true to allow proper cleanup of cron jobs
      gracefulShutdown: true
    }),
    // Register cache module with default options
    CacheModule.register(),
    // Register the SSH infrastructure module first - this ensures a single instance of services
    SshInfrastructureModule,
    MongooseModule.forRootAsync({
      useFactory: async () => {
        // Create a direct mongoose connection first
        const uri = `mongodb://${db.host}:${db.port}/${db.name}`;
        logger.info(`Connecting to MongoDB: ${uri}`);

        // If mongoose is already connected, use that connection
        if (mongoose.connection.readyState === 1) {
          logger.info('Mongoose is already connected, using existing connection');
          sharedConnection = mongoose.connection;
          connectionReady = true;
          return {
            uri,
            autoIndex: true,
            minPoolSize: db.minPoolSize,
            maxPoolSize: db.maxPoolSize,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
          };
        }

        // Connect directly with mongoose first
        try {
          await mongoose.connect(uri, {
            autoIndex: true,
            minPoolSize: db.minPoolSize,
            maxPoolSize: db.maxPoolSize,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
          });

          sharedConnection = mongoose.connection;

          // Set up connection event handlers
          mongoose.connection.on('connected', () => {
            logger.info('Mongoose connected to MongoDB');
            connectionReady = true;
          });

          mongoose.connection.on('error', (err) => {
            logger.error(`Mongoose connection error: ${err}`);
            connectionReady = false;
          });

          mongoose.connection.on('disconnected', () => {
            logger.warn('Mongoose disconnected from MongoDB');
            connectionReady = false;
          });

          logger.info('Direct mongoose connection established');
        } catch (error) {
          logger.error(`Failed to connect to MongoDB: ${error}`);
          throw error;
        }

        // Return the same connection config for NestJS to use
        return {
          uri,
          autoIndex: true,
          minPoolSize: db.minPoolSize,
          maxPoolSize: db.maxPoolSize,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          // Use the existing mongoose connection
          connectionFactory: () => {
            logger.info('NestJS using the same mongoose connection');
            return mongoose.connection;
          },
        };
      },
    }),
    AuthModule,
    StatisticsModule,
    //   AutomationsModule,
    ContainerStacksModule,
    // ContainersModule,
    DevicesModule,
    UpdateModule,
    DiagnosticModule,
    ShellModule,
    // Make sure the SshModule is provided as a global module with dynamic registration
    // This ensures that there's only one instance of the module and its providers
    SshModule,
    SftpModule,
    LogsModule,
    AnsibleModule,
    AnsibleConfigModule,
    AnsibleVaultModule,
    SmartFailureModule,
    NotificationsModule,
    PlaybooksModule,
    UsersModule,
    SchedulerModule,
    SettingsModule,
    HealthModule,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    // Set mongoose options
    mongoose.set('strictQuery', true);

    // Add the plugin for validators
    function setRunValidators(this: any) {
      this.setOptions({ runValidators: true });
    }

    mongoose.plugin((schema: any) => {
      schema.pre('findOneAndUpdate', setRunValidators);
      schema.pre('updateMany', setRunValidators);
      schema.pre('updateOne', setRunValidators);
      schema.pre('update', setRunValidators);
    });

    // Store the NestJS app reference globally for bridge access
    (global as any).nestApp = this;
  }
}

// Export the shared connection for legacy code
export function getSharedConnection(): mongoose.Connection {
  if (!sharedConnection) {
    throw new Error('MongoDB connection not yet established');
  }
  return sharedConnection;
}

// Check if the connection is ready
export function isConnectionReady(): boolean {
  logger.info(`Connection ready: ${connectionReady}`);
  return connectionReady && sharedConnection?.readyState === 1;
}
