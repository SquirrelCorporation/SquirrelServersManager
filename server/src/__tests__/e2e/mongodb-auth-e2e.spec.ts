import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server';
import * as pino from 'pino';

/**
 * End-to-End tests for MongoDB authentication using in-memory MongoDB
 */
describe('MongoDB Authentication E2E Tests', () => {
  let mongoServerNoAuth: MongoMemoryServer;
  let mongoServerWithAuth: MongoMemoryReplSet;

  const authConfig = {
    user: 'testuser',
    password: 'testpass',
    authDb: 'testauth',
  };

  beforeAll(async () => {
    // Start MongoDB without authentication
    mongoServerNoAuth = await MongoMemoryServer.create({
      auth: false,
    });

    // Start MongoDB with authentication (using replica set for auth support)
    mongoServerWithAuth = await MongoMemoryReplSet.create({
      replSet: {
        count: 1,
        storageEngine: 'wiredTiger',
      },
      auth: {
        enable: true,
        customRootName: 'root',
        customRootPwd: 'rootpass',
      },
    });

    // Wait for replica set to be ready
    await mongoServerWithAuth.waitUntilRunning();

    // Create test user in authenticated MongoDB
    const adminUri = mongoServerWithAuth.getUri('admin');
    const adminClient = new MongoClient(adminUri);

    try {
      await adminClient.connect();

      // Create the test auth database and user
      await adminClient.db('admin').command({
        createUser: authConfig.user,
        pwd: authConfig.password,
        roles: [
          { role: 'readWrite', db: authConfig.authDb },
          { role: 'readWrite', db: 'testdb' },
          { role: 'readWrite', db: 'logdb' },
        ],
      });
    } finally {
      await adminClient.close();
    }
  }, 60000);

  afterAll(async () => {
    await mongoServerNoAuth?.stop();
    await mongoServerWithAuth?.stop();
  });

  beforeEach(async () => {
    // Clean up mongoose connections
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe('Unauthenticated MongoDB', () => {
    it('should connect without credentials', async () => {
      const uri = mongoServerNoAuth.getUri();
      const connection = await mongoose.connect(uri);

      expect(connection.connection.readyState).toBe(1); // Connected

      // Test basic operation
      const testCollection = connection.connection.db.collection('test');
      await testCollection.insertOne({ test: 'data' });
      const result = await testCollection.findOne({ test: 'data' });

      expect(result).toMatchObject({ test: 'data' });

      await connection.disconnect();
    });

    it('should work with pino-mongodb logger without auth', async () => {
      const uri = mongoServerNoAuth.getUri();
      const [host, port] = uri.replace('mongodb://', '').split('/')[0].split(':');

      const transport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: `mongodb://${host}:${port}/`,
          database: 'logdb',
          collection: 'logs',
        },
      });

      const logger = pino.default(transport);

      // Log a test message
      logger.info({ test: 'log' }, 'Test log message');

      // Wait for log to be written
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify log was written
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const logs = await client.db('logdb').collection('logs').findOne({ test: 'log' });
        expect(logs).toBeTruthy();
        expect(logs.msg).toBe('Test log message');
      } finally {
        await client.close();
        transport.end();
      }
    });
  });

  describe('Authenticated MongoDB', () => {
    it('should connect with credentials and correct authSource', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const [hostPort] = baseUri.replace('mongodb://', '').split('/');
      const uri = `mongodb://${authConfig.user}:${authConfig.password}@${hostPort}/testdb?authSource=admin`;

      const connection = await mongoose.connect(uri);

      expect(connection.connection.readyState).toBe(1); // Connected

      // Test basic operation
      const testCollection = connection.connection.db.collection('authtest');
      await testCollection.insertOne({ test: 'authenticated' });
      const result = await testCollection.findOne({ test: 'authenticated' });

      expect(result).toMatchObject({ test: 'authenticated' });

      await connection.disconnect();
    });

    it('should fail with wrong authSource', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const [hostPort] = baseUri.replace('mongodb://', '').split('/');
      const uri = `mongodb://${authConfig.user}:${authConfig.password}@${hostPort}/testdb?authSource=wrongauth`;

      await expect(mongoose.connect(uri)).rejects.toThrow(/Authentication failed/);
    });

    it('should fail when authSource is not specified (defaults to admin but user not there)', async () => {
      // Create a user in a different database
      const adminUri = mongoServerWithAuth.getUri('admin');
      const adminClient = new MongoClient(adminUri);

      try {
        await adminClient.connect();
        await adminClient.db('customauth').command({
          createUser: 'customuser',
          pwd: 'custompass',
          roles: [{ role: 'readWrite', db: 'testdb' }],
        });
      } finally {
        await adminClient.close();
      }

      // Try to connect without specifying authSource (will default to admin)
      const baseUri = mongoServerWithAuth.getUri();
      const [hostPort] = baseUri.replace('mongodb://', '').split('/');
      const uri = `mongodb://customuser:custompass@${hostPort}/testdb`;

      await expect(mongoose.connect(uri)).rejects.toThrow(/Authentication failed/);
    });

    it('should work with pino-mongodb logger with auth and authSource', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const [hostPort] = baseUri.replace('mongodb://', '').split('/');
      const [host, port] = hostPort.split(':');

      const transport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: `mongodb://${host}:${port}/`,
          database: 'logdb',
          collection: 'logs',
          mongoOptions: {
            auth: {
              username: authConfig.user,
              password: authConfig.password,
            },
            authSource: 'admin',
          },
        },
      });

      const logger = pino.default(transport);

      // Log a test message
      logger.info({ test: 'authlog' }, 'Authenticated log message');

      // Wait for log to be written
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify log was written using authenticated connection
      const client = new MongoClient(
        `mongodb://${authConfig.user}:${authConfig.password}@${hostPort}/`,
        { authSource: 'admin' },
      );

      try {
        await client.connect();
        const logs = await client.db('logdb').collection('logs').findOne({ test: 'authlog' });
        expect(logs).toBeTruthy();
        expect(logs.msg).toBe('Authenticated log message');
      } finally {
        await client.close();
        transport.end();
      }
    });

    it('should fail pino-mongodb with wrong authSource', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const [hostPort] = baseUri.replace('mongodb://', '').split('/');
      const [host, port] = hostPort.split(':');

      let errorOccurred = false;

      // Create a custom error handler to catch connection errors
      const errorHandler = () => {
        errorOccurred = true;
      };

      try {
        const transport = pino.transport({
          target: 'pino-mongodb',
          options: {
            uri: `mongodb://${host}:${port}/`,
            database: 'logdb',
            collection: 'logs',
            mongoOptions: {
              auth: {
                username: authConfig.user,
                password: authConfig.password,
              },
              authSource: 'wrongauth', // Wrong auth source
            },
          },
        });

        transport.on('error', errorHandler);

        // Give it time to attempt connection
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // The transport should have failed
        transport.end();
      } catch {
        errorOccurred = true;
      }

      expect(errorOccurred).toBe(true);
    });
  });

  describe('NestJS Integration', () => {
    it('should configure MongooseModule correctly with authSource', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const [hostPort] = baseUri.replace('mongodb://', '').split('/');
      const [host, port] = hostPort.split(':');

      // Mock the config
      const mockConfig = {
        host,
        port,
        name: 'nestdb',
        user: authConfig.user,
        password: authConfig.password,
        authSource: 'admin',
      };

      // Build the options as done in app.module.ts
      const mongooseOptions = {
        ...(mockConfig.user && mockConfig.password && { authSource: mockConfig.authSource }),
      };

      // Create a test module
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(
            `mongodb://${mockConfig.user}:${mockConfig.password}@${mockConfig.host}:${mockConfig.port}/${mockConfig.name}`,
            mongooseOptions,
          ),
        ],
      }).compile();

      const app = module.createNestApplication();
      await app.init();

      // If we got here, connection was successful
      expect(app).toBeDefined();

      await app.close();
    });

    it('should simulate app.module.ts configuration pattern', async () => {
      // This test verifies the exact pattern used in app.module.ts
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'apptest';
      process.env.DB_USER = 'appuser';
      process.env.DB_USER_PWD = 'apppass';
      process.env.DB_AUTH_SOURCE = 'appauthdb';

      vi.resetModules();
      const { db } = await import('../../config');

      // Simulate app.module.ts MongooseModule options
      const mongooseModuleOptions = {
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

      // Simulate app.module.ts pino-mongodb options
      const pinoMongoOptions = {
        uri: `mongodb://${db.host}:${db.port}/`,
        database: `${db.name}`,
        collection: 'logs',
        ...(db.user &&
          db.password && {
            mongoOptions: {
              auth: {
                username: db.user,
                password: db.password,
              },
              authSource: db.authSource,
            },
          }),
      };

      // Verify both configurations use the custom authSource
      expect(mongooseModuleOptions.authSource).toBe('appauthdb');
      expect(pinoMongoOptions.mongoOptions.authSource).toBe('appauthdb');
    });
  });
});
