import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { db } from './config';
import logger from './logger';
import { AuthModule } from './modules/auth/auth.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { DiagnosticModule } from './modules/diagnostic/diagnostic.module';
import { UpdateModule } from './modules/update/update.module';

// Store the connection for legacy code to access
let sharedConnection: mongoose.Connection | null = null;
let connectionReady = false;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
          connectionFactory: (connection) => {
            logger.info('NestJS using the same mongoose connection');
            return mongoose.connection;
          },
        };
      },
    }),
    AuthModule,
    AutomationsModule,
    UpdateModule,
    DiagnosticModule,
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
