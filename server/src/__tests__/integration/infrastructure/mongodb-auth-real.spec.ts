import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import * as pino from 'pino';
import { spawn } from 'child_process';

describe('MongoDB Authentication Real Tests', () => {
  let mongoServer: MongoMemoryServer;
  let mongoServerAuth: MongoMemoryServer;

  beforeAll(async () => {
    // Start MongoDB without authentication
    mongoServer = await MongoMemoryServer.create({
      instance: {
        auth: false,
      },
    });

    // Start MongoDB with authentication
    mongoServerAuth = await MongoMemoryServer.create({
      instance: {
        auth: true,
      },
    });

    // Create users in the authenticated instance
    const authUri = mongoServerAuth.getUri();
    const adminClient = new MongoClient(authUri);
    
    try {
      await adminClient.connect();
      
      // Create admin user
      await adminClient.db('admin').command({
        createUser: 'admin',
        pwd: 'adminpass',
        roles: [{ role: 'root', db: 'admin' }],
      });

      // Create users in different databases to test authSource
      const adminAuthClient = new MongoClient(`${authUri}?authSource=admin`, {
        auth: { username: 'admin', password: 'adminpass' },
      });
      await adminAuthClient.connect();

      // Create user in 'testdb' database
      await adminAuthClient.db('testdb').command({
        createUser: 'testuser',
        pwd: 'testpass',
        roles: [
          { role: 'readWrite', db: 'testdb' },
          { role: 'readWrite', db: 'logs' },
        ],
      });

      // Create user in 'customauth' database
      await adminAuthClient.db('customauth').command({
        createUser: 'customuser',
        pwd: 'custompass',
        roles: [
          { role: 'readWrite', db: 'appdb' },
          { role: 'readWrite', db: 'logs' },
        ],
      });

      await adminAuthClient.close();
    } finally {
      await adminClient.close();
    }
  }, 60000);

  afterAll(async () => {
    await mongoServer?.stop();
    await mongoServerAuth?.stop();
  });

  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe('Real MongoDB Authentication Tests', () => {
    it('should connect to MongoDB without authentication', async () => {
      const uri = mongoServer.getUri();
      
      // Test direct connection
      const client = new MongoClient(uri);
      await client.connect();
      
      const db = client.db('testdb');
      const collection = db.collection('test');
      
      await collection.insertOne({ test: 'noauth' });
      const result = await collection.findOne({ test: 'noauth' });
      
      expect(result).toMatchObject({ test: 'noauth' });
      
      await client.close();

      // Test mongoose connection
      await mongoose.connect(uri);
      expect(mongoose.connection.readyState).toBe(1);
      await mongoose.disconnect();
    });

    it('should fail to connect with wrong credentials', async () => {
      const baseUri = mongoServerAuth.getUri();
      const uri = baseUri.replace('mongodb://', 'mongodb://wronguser:wrongpass@');
      
      const client = new MongoClient(uri);
      
      await expect(client.connect()).rejects.toThrow(/Authentication failed/);
    });

    it('should connect with correct authSource', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      
      // Connect with user from testdb (authSource=testdb)
      const uri = `mongodb://testuser:testpass@${host}/appdb?authSource=testdb`;
      
      const client = new MongoClient(uri);
      await client.connect();
      
      const db = client.db('appdb');
      const collection = db.collection('test');
      
      await collection.insertOne({ test: 'authenticated' });
      const result = await collection.findOne({ test: 'authenticated' });
      
      expect(result).toMatchObject({ test: 'authenticated' });
      
      await client.close();
    });

    it('should fail with wrong authSource', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      
      // Try to authenticate testuser against admin database (wrong authSource)
      const uri = `mongodb://testuser:testpass@${host}/appdb?authSource=admin`;
      
      const client = new MongoClient(uri);
      
      await expect(client.connect()).rejects.toThrow(/Authentication failed/);
    });

    it('should connect with mongoose using authSource in connection string', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      
      const uri = `mongodb://customuser:custompass@${host}/appdb?authSource=customauth`;
      
      await mongoose.connect(uri);
      expect(mongoose.connection.readyState).toBe(1);
      
      // Test database operation
      const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
      const doc = await TestModel.create({ name: 'test' });
      expect(doc.name).toBe('test');
      
      await mongoose.disconnect();
    });

    it('should connect with mongoose using authSource in options', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      
      const uri = `mongodb://customuser:custompass@${host}/appdb`;
      
      await mongoose.connect(uri, {
        authSource: 'customauth',
      });
      
      expect(mongoose.connection.readyState).toBe(1);
      await mongoose.disconnect();
    });
  });

  describe('Pino MongoDB Authentication Tests', () => {
    it('should authenticate pino-mongodb with authSource', async () => {
      const baseUri = mongoServerAuth.getUri();
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
              username: 'testuser',
              password: 'testpass',
            },
            authSource: 'testdb',
          },
        },
      });

      const logger = pino.default(transport);
      
      // Log some messages
      logger.info({ action: 'test' }, 'Test log with auth');
      logger.error({ error: 'test error' }, 'Error log with auth');
      
      // Wait for logs to be written
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify logs were written by connecting with same auth
      const client = new MongoClient(
        `mongodb://testuser:testpass@${host}/logs?authSource=testdb`
      );
      
      await client.connect();
      const logs = await client.db('logs').collection('app-logs').find({}).toArray();
      
      expect(logs.length).toBeGreaterThanOrEqual(2);
      expect(logs.some(log => log.msg === 'Test log with auth')).toBe(true);
      expect(logs.some(log => log.msg === 'Error log with auth')).toBe(true);
      
      await client.close();
      transport.end();
    });

    it('should fail pino-mongodb with wrong authSource', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      const [hostname, port] = host.split(':');
      
      let errorOccurred = false;
      
      const transport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: `mongodb://${hostname}:${port}/`,
          database: 'logs',
          collection: 'app-logs',
          mongoOptions: {
            auth: {
              username: 'testuser',
              password: 'testpass',
            },
            authSource: 'admin', // Wrong - user is in testdb
          },
        },
      });

      transport.on('error', () => {
        errorOccurred = true;
      });

      // Give time for connection to fail
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      transport.end();
      
      // The transport should have encountered an error
      expect(errorOccurred).toBe(true);
    });
  });

  describe('App Configuration Simulation', () => {
    it('should work with the exact app.module.ts pattern', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      const [hostname, port] = host.split(':');
      
      // Simulate environment variables
      const db = {
        host: hostname,
        port: port,
        name: 'appdb',
        user: 'customuser',
        password: 'custompass',
        authSource: 'customauth',
      };

      // Test Mongoose pattern from app.module.ts
      const mongoUri = `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}?authSource=${db.authSource}`;
      const mongooseOptions = {
        ...(db.user && db.password && { authSource: db.authSource }),
      };

      await mongoose.connect(mongoUri, mongooseOptions);
      expect(mongoose.connection.readyState).toBe(1);
      await mongoose.disconnect();

      // Test pino-mongodb pattern from app.module.ts
      const pinoTransport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: `mongodb://${db.host}:${db.port}/`,
          database: db.name,
          collection: 'logs',
          ...(db.user && db.password && {
            mongoOptions: {
              auth: {
                username: db.user,
                password: db.password,
              },
              authSource: db.authSource,
            },
          }),
        },
      });

      const logger = pino.default(pinoTransport);
      logger.info('App pattern test');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      pinoTransport.end();
    });
  });

  describe('Real-world Scenario Test', () => {
    it('should handle the mash-ssm scenario correctly', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      const [hostname, port] = host.split(':');
      
      // Create mash-ssm user in mash-ssm database
      const adminClient = new MongoClient(
        `mongodb://admin:adminpass@${host}/admin?authSource=admin`
      );
      
      await adminClient.connect();
      
      try {
        await adminClient.db('mash-ssm').command({
          createUser: 'mash-ssm',
          pwd: 'password',
          roles: [
            { role: 'readWrite', db: 'mash-ssm' },
            { role: 'readWrite', db: 'logs' },
          ],
        });
      } catch (error) {
        // User might already exist from previous test run
      }
      
      await adminClient.close();

      // Simulate the exact user configuration
      const config = {
        DB_HOST: hostname,
        DB_PORT: port,
        DB_NAME: 'mash-ssm',
        DB_USER: 'mash-ssm',
        DB_USER_PWD: 'password',
        DB_AUTH_SOURCE: 'mash-ssm',
      };

      // Test connection with authSource
      const uri = `mongodb://${config.DB_USER}:${config.DB_USER_PWD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}?authSource=${config.DB_AUTH_SOURCE}`;
      
      const client = new MongoClient(uri);
      await client.connect();
      
      // Should be able to perform operations
      const result = await client.db().collection('test').insertOne({ test: 'mash-ssm' });
      expect(result.acknowledged).toBe(true);
      
      await client.close();

      // Test what happens without authSource (defaults to the database name, so it works!)
      const uriDefault = `mongodb://${config.DB_USER}:${config.DB_USER_PWD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
      const clientDefault = new MongoClient(uriDefault);
      
      await clientDefault.connect();
      await clientDefault.close();
      
      // Test with wrong authSource (should fail)
      const uriBad = `mongodb://${config.DB_USER}:${config.DB_USER_PWD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}?authSource=admin`;
      const clientBad = new MongoClient(uriBad);
      
      await expect(clientBad.connect()).rejects.toThrow(/Authentication failed/);
    });
  });
});