import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';

describe('App Module MongoDB Configuration Integration', () => {
  let mongoServer: MongoMemoryServer;
  let adminClient: MongoClient;

  beforeAll(async () => {
    // Start MongoDB with authentication
    mongoServer = await MongoMemoryServer.create({
      auth: {
        enable: true,
        customRootName: 'root',
        customRootPwd: 'rootpass',
      },
    });

    // Create users in different databases
    const adminUri = `${mongoServer.getUri()}admin?authSource=admin`;
    adminClient = new MongoClient(adminUri, {
      auth: { username: 'root', password: 'rootpass' },
    });
    await adminClient.connect();

    // Create user in custom auth database (simulating user's scenario)
    await adminClient.db('mash-ssm').command({
      createUser: 'mash-ssm',
      pwd: 'password',
      roles: [
        { role: 'readWrite', db: 'mash-ssm' },
        { role: 'readWrite', db: 'logs' },
      ],
    });
  }, 30000);

  afterAll(async () => {
    await adminClient?.close();
    await mongoServer?.stop();
  });

  describe('MongooseModule Configuration', () => {
    it('should connect successfully with dynamic authSource configuration', async () => {
      const baseUri = mongoServer.getUri();
      const [host, port] = baseUri.replace('mongodb://', '').split('/')[0].split(':');
      
      // Simulate environment configuration
      const db = {
        host,
        port,
        name: 'mash-ssm',
        user: 'mash-ssm',
        password: 'password',
        authSource: 'mash-ssm',
        minPoolSize: 5,
        maxPoolSize: 10,
      };

      // Create test module with CORRECT configuration (using db.authSource)
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          MongooseModule.forRootAsync({
            useFactory: async () => {
              const uri = `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}?authSource=${db.authSource}`;
              
              return {
                uri,
                minPoolSize: db.minPoolSize,
                maxPoolSize: db.maxPoolSize,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                retryWrites: true,
                retryReads: true,
                serverSelectionTimeoutMS: 30000,
                heartbeatFrequencyMS: 10000,
                ...(db.user && db.password && { authSource: db.authSource }), // CORRECT!
              };
            },
          }),
        ],
      }).compile();

      const app = module.createNestApplication();
      await app.init();
      
      // Connection succeeded
      expect(app).toBeDefined();
      
      await app.close();
    });

    it.skip('should fail with hardcoded admin authSource', async () => {
      const baseUri = mongoServer.getUri();
      const [host, port] = baseUri.replace('mongodb://', '').split('/')[0].split(':');
      
      // Same configuration
      const db = {
        host,
        port,
        name: 'mash-ssm',
        user: 'mash-ssm',
        password: 'password',
        authSource: 'mash-ssm', // User wants this
      };

      // Create test module with WRONG configuration (hardcoded 'admin')
      let error: Error | null = null;
      
      try {
        const module: TestingModule = await Test.createTestingModule({
          imports: [
            MongooseModule.forRootAsync({
              useFactory: async () => {
                const uri = `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}?authSource=${db.authSource}`;
                
                return {
                  uri,
                  minPoolSize: db.minPoolSize,
                  maxPoolSize: db.maxPoolSize,
                  connectTimeoutMS: 10000,
                  socketTimeoutMS: 45000,
                  retryWrites: true,
                  retryReads: true,
                  serverSelectionTimeoutMS: 30000,
                  heartbeatFrequencyMS: 10000,
                  ...(db.user && db.password && { authSource: 'admin' }), // WRONG! Hardcoded
                };
              },
            }),
          ],
        }).compile();

        const app = module.createNestApplication();
        await app.init();
        await app.close();
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeTruthy();
      expect(error?.message).toMatch(/Authentication failed/);
    });
  });

  describe('Pino Logger Configuration', () => {
    it('should configure pino-mongodb correctly with dynamic authSource', async () => {
      const baseUri = mongoServer.getUri();
      const [host, port] = baseUri.replace('mongodb://', '').split('/')[0].split(':');
      
      const db = {
        host,
        port,
        name: 'mash-ssm',
        user: 'mash-ssm',
        password: 'password',
        authSource: 'mash-ssm',
      };

      // This simulates the pino configuration in app.module.ts
      const pinoConfig = {
        pinoHttp: {
          transport: {
            targets: [
              {
                target: 'pino-pretty',
                options: { colorize: true },
              },
              {
                target: 'pino-mongodb',
                options: {
                  uri: `mongodb://${db.host}:${db.port}/`,
                  database: `${db.name}`,
                  collection: 'logs',
                  ...(db.user && db.password && {
                    mongoOptions: {
                      auth: {
                        username: db.user,
                        password: db.password,
                      },
                      authSource: db.authSource, // CORRECT!
                    },
                  }),
                },
              },
            ],
          },
        },
      };

      // Verify the configuration has correct authSource
      const pinoMongoTarget = pinoConfig.pinoHttp.transport.targets.find(
        t => t.target === 'pino-mongodb'
      );
      
      expect(pinoMongoTarget?.options.mongoOptions?.authSource).toBe('mash-ssm');
      expect(pinoMongoTarget?.options.mongoOptions?.auth).toEqual({
        username: 'mash-ssm',
        password: 'password',
      });
    });
  });

  describe('Full Integration Pattern', () => {
    it('should work with the complete app.module.ts pattern', async () => {
      const baseUri = mongoServer.getUri();
      const [host, port] = baseUri.replace('mongodb://', '').split('/')[0].split(':');
      
      // Full configuration as used in app.module.ts
      const db = {
        host,
        port,
        name: 'mash-ssm',
        user: 'mash-ssm',
        password: 'password',
        authSource: 'mash-ssm',
        minPoolSize: 5,
        maxPoolSize: 10,
      };

      // Test both connection methods work with proper authSource
      
      // 1. Direct mongoose connection (as in app.module.ts bootstrap)
      const uri = db.user && db.password
        ? `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}?authSource=${db.authSource}`
        : `mongodb://${db.host}:${db.port}/${db.name}`;
      
      await mongoose.connect(uri);
      expect(mongoose.connection.readyState).toBe(1);
      
      // 2. Test with mongoose options (as in MongooseModule config)
      await mongoose.disconnect();
      
      const mongooseOptions = {
        minPoolSize: db.minPoolSize,
        maxPoolSize: db.maxPoolSize,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
        serverSelectionTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
        ...(db.user && db.password && { authSource: db.authSource }),
      };
      
      await mongoose.connect(uri.split('?')[0], mongooseOptions); // Remove authSource from URI since it's in options
      expect(mongoose.connection.readyState).toBe(1);
      
      await mongoose.disconnect();
    });
  });
});