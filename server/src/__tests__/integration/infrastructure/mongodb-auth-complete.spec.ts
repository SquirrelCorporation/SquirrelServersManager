import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import * as pino from 'pino';

describe('MongoDB Complete Authentication Tests - Both Auth and No-Auth', () => {
  let mongoServerNoAuth: MongoMemoryServer;
  let mongoServerWithAuth: MongoMemoryServer;
  let adminClient: MongoClient;

  beforeAll(async () => {
    // 1. Start MongoDB WITHOUT authentication
    mongoServerNoAuth = await MongoMemoryServer.create({
      instance: {
        auth: false,
      },
    });

    // 2. Start MongoDB WITH authentication
    mongoServerWithAuth = await MongoMemoryServer.create({
      auth: {
        enable: true,
        customRootName: 'root',
        customRootPwd: 'rootpass',
      },
    });

    // Create users in authenticated instance
    const adminUri = `${mongoServerWithAuth.getUri()}admin?authSource=admin`;
    adminClient = new MongoClient(adminUri, {
      auth: { username: 'root', password: 'rootpass' },
    });
    await adminClient.connect();

    // Create user in custom database (like mash-ssm)
    await adminClient.db('customdb').command({
      createUser: 'customuser',
      pwd: 'custompass',
      roles: [
        { role: 'readWrite', db: 'customdb' },
        { role: 'readWrite', db: 'logs' },
      ],
    });
  }, 30000);

  afterAll(async () => {
    await adminClient?.close();
    await mongoServerNoAuth?.stop();
    await mongoServerWithAuth?.stop();
  });

  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe('Unauthenticated MongoDB Tests', () => {
    it('should connect to MongoDB without any credentials', async () => {
      const uri = mongoServerNoAuth.getUri();

      // Test direct connection
      const client = new MongoClient(uri);
      await client.connect();

      const result = await client.db('testdb').collection('test').insertOne({ test: 'no-auth' });
      expect(result.acknowledged).toBe(true);

      await client.close();
    });

    it('should work with mongoose without credentials', async () => {
      const uri = mongoServerNoAuth.getUri();

      await mongoose.connect(uri);
      expect(mongoose.connection.readyState).toBe(1);

      const TestModel = mongoose.model('NoAuthTest', new mongoose.Schema({ name: String }));
      const doc = await TestModel.create({ name: 'no-auth-test' });
      expect(doc.name).toBe('no-auth-test');
    });

    it('should work with pino-mongodb without authentication', async () => {
      const uri = mongoServerNoAuth.getUri();
      const [host, port] = uri.replace('mongodb://', '').split('/')[0].split(':');

      const transport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: `mongodb://${host}:${port}/`,
          database: 'logs',
          collection: 'app-logs',
          // No mongoOptions needed for unauthenticated connection
        },
      });

      const logger = pino.default(transport);
      logger.info({ test: 'no-auth' }, 'Unauthenticated log');

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify log was written
      const client = new MongoClient(uri);
      await client.connect();
      const logs = await client.db('logs').collection('app-logs').find({}).toArray();
      expect(logs.some((log) => log.msg === 'Unauthenticated log')).toBe(true);

      await client.close();
      transport.end();
    });

    it('should simulate app.module.ts pattern without authentication', async () => {
      const uri = mongoServerNoAuth.getUri();
      const [host, port] = uri.replace('mongodb://', '').split('/')[0].split(':');

      // Simulate environment without auth
      const db = {
        host,
        port,
        name: 'testdb',
        user: '',
        password: '',
        authSource: 'admin', // Default, but won't be used
      };

      // MongooseModule pattern - no authSource added when no credentials
      const mongooseOptions = {
        minPoolSize: 5,
        maxPoolSize: 10,
        ...(db.user && db.password && { authSource: db.authSource }),
      };

      expect(mongooseOptions.authSource).toBeUndefined(); // No authSource when no auth

      // Connection string without credentials
      const connectionUri = `mongodb://${db.host}:${db.port}/${db.name}`;
      await mongoose.connect(connectionUri, mongooseOptions);
      expect(mongoose.connection.readyState).toBe(1);
      await mongoose.disconnect();

      // Pino pattern - no mongoOptions when no auth
      const pinoOptions = {
        uri: `mongodb://${db.host}:${db.port}/`,
        database: db.name,
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

      expect(pinoOptions.mongoOptions).toBeUndefined(); // No mongoOptions when no auth
    });
  });

  describe('Authenticated MongoDB Tests', () => {
    it('should connect with credentials and correct authSource', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');

      const uri = `mongodb://customuser:custompass@${host}/customdb?authSource=customdb`;

      const client = new MongoClient(uri);
      await client.connect();

      const result = await client.db().collection('test').insertOne({ test: 'with-auth' });
      expect(result.acknowledged).toBe(true);

      await client.close();
    });

    it('should fail with wrong authSource', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');

      // Wrong authSource (user is in customdb, not admin)
      const uri = `mongodb://customuser:custompass@${host}/customdb?authSource=admin`;

      const client = new MongoClient(uri);
      await expect(client.connect()).rejects.toThrow(/Authentication failed/);
    });

    it('should work with mongoose using correct authSource', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');

      const uri = `mongodb://customuser:custompass@${host}/customdb`;

      await mongoose.connect(uri, { authSource: 'customdb' });
      expect(mongoose.connection.readyState).toBe(1);

      const TestModel = mongoose.model('AuthTest', new mongoose.Schema({ name: String }));
      const doc = await TestModel.create({ name: 'auth-test' });
      expect(doc.name).toBe('auth-test');
    });

    it('should work with pino-mongodb with authentication', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      const [hostname, port] = host.split(':');

      const transport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: `mongodb://${hostname}:${port}/`,
          database: 'logs',
          collection: 'app-logs',
          mongoOptions: {
            auth: {
              username: 'customuser',
              password: 'custompass',
            },
            authSource: 'customdb',
          },
        },
      });

      const logger = pino.default(transport);
      logger.info({ test: 'with-auth' }, 'Authenticated log');

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify log was written
      const client = new MongoClient(
        `mongodb://customuser:custompass@${host}/logs?authSource=customdb`,
      );
      await client.connect();
      const logs = await client.db('logs').collection('app-logs').find({}).toArray();
      expect(logs.some((log) => log.msg === 'Authenticated log')).toBe(true);

      await client.close();
      transport.end();
    });

    it('should simulate app.module.ts pattern with authentication', async () => {
      const baseUri = mongoServerWithAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      const [hostname, port] = host.split(':');

      // Simulate environment with auth
      const db = {
        host: hostname,
        port,
        name: 'customdb',
        user: 'customuser',
        password: 'custompass',
        authSource: 'customdb',
      };

      // MongooseModule pattern - authSource added when credentials exist
      const mongooseOptions = {
        minPoolSize: 5,
        maxPoolSize: 10,
        ...(db.user && db.password && { authSource: db.authSource }),
      };

      expect(mongooseOptions.authSource).toBe('customdb'); // authSource present

      // Connection string with credentials
      const connectionUri = `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}?authSource=${db.authSource}`;
      await mongoose.connect(connectionUri.split('?')[0], mongooseOptions);
      expect(mongoose.connection.readyState).toBe(1);
      await mongoose.disconnect();

      // Pino pattern - mongoOptions present when auth is configured
      const pinoOptions = {
        uri: `mongodb://${db.host}:${db.port}/`,
        database: db.name,
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

      expect(pinoOptions.mongoOptions).toBeDefined();
      expect(pinoOptions.mongoOptions.authSource).toBe('customdb');
    });
  });

  describe('Edge Case Tests', () => {
    it('should handle empty string credentials as no auth', async () => {
      const db = {
        user: '',
        password: '',
        authSource: 'admin',
      };

      // Both patterns should treat empty strings as no auth
      const mongooseOptions = {
        ...(db.user && db.password && { authSource: db.authSource }),
      };

      const pinoOptions = {
        ...(db.user &&
          db.password && {
            mongoOptions: {
              auth: { username: db.user, password: db.password },
              authSource: db.authSource,
            },
          }),
      };

      expect(mongooseOptions.authSource).toBeUndefined();
      expect(pinoOptions.mongoOptions).toBeUndefined();
    });

    it('should handle whitespace-only credentials as no auth', async () => {
      const db = {
        user: '  ',
        password: '  ',
        authSource: 'admin',
      };

      // Should trim and treat as no auth
      const mongooseOptions = {
        ...(db.user.trim() && db.password.trim() && { authSource: db.authSource }),
      };

      expect(mongooseOptions.authSource).toBeUndefined();
    });
  });
});
