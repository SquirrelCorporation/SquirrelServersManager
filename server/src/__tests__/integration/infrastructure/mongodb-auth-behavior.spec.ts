import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

describe('MongoDB Authentication Behavior Tests', () => {
  let mongoServerAuth: MongoMemoryServer;
  let adminClient: MongoClient;

  beforeAll(async () => {
    // Start MongoDB with authentication enabled
    mongoServerAuth = await MongoMemoryServer.create({
      auth: {
        enable: true,
        customRootName: 'admin',
        customRootPwd: 'adminpass',
      },
    });

    const adminUri = `${mongoServerAuth.getUri()}admin?authSource=admin`;
    adminClient = new MongoClient(adminUri, {
      auth: {
        username: 'admin',
        password: 'adminpass',
      },
    });

    await adminClient.connect();

    // Create test scenario: user exists in 'mash-ssm' database but NOT in 'admin'
    await adminClient.db('mash-ssm').command({
      createUser: 'mash-ssm',
      pwd: 'password',
      roles: [
        { role: 'readWrite', db: 'mash-ssm' },
        { role: 'readWrite', db: 'logs' },
      ],
    });

    // Create another user in admin database for comparison
    await adminClient.db('admin').command({
      createUser: 'adminuser',
      pwd: 'adminpass',
      roles: [{ role: 'readWrite', db: 'testdb' }],
    });
  }, 30000);

  afterAll(async () => {
    await adminClient?.close();
    await mongoServerAuth?.stop();
  });

  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe('MongoDB authSource Default Behavior', () => {
    it('should default authSource to the database name when not specified', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');

      // Connect WITHOUT specifying authSource
      // MongoDB will use 'mash-ssm' (the database name) as authSource
      const uri = `mongodb://mash-ssm:password@${host}/mash-ssm`;

      const client = new MongoClient(uri);
      await client.connect();

      // This works because user 'mash-ssm' exists in database 'mash-ssm'
      const result = await client.db().collection('test').insertOne({ test: 'default-auth' });
      expect(result.acknowledged).toBe(true);

      await client.close();
    });

    it('should fail when user exists in custom db but authSource defaults to admin', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');

      // This is what happens in the user's broken scenario:
      // - User 'mash-ssm' exists in database 'mash-ssm'
      // - But the code hardcodes authSource to 'admin'
      // - User 'mash-ssm' does NOT exist in 'admin' database
      const uri = `mongodb://mash-ssm:password@${host}/mash-ssm?authSource=admin`;

      const client = new MongoClient(uri);

      // This fails because we're looking for user in wrong database
      await expect(client.connect()).rejects.toThrow(/Authentication failed/);
    });

    it('should work when explicitly setting correct authSource', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');

      // Correctly specify authSource as 'mash-ssm'
      const uri = `mongodb://mash-ssm:password@${host}/mash-ssm?authSource=mash-ssm`;

      const client = new MongoClient(uri);
      await client.connect();

      const result = await client.db().collection('test').insertOne({ test: 'explicit-auth' });
      expect(result.acknowledged).toBe(true);

      await client.close();
    });

    it('should demonstrate the difference between connection string and options authSource', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');

      // Method 1: authSource in connection string
      const uri1 = `mongodb://mash-ssm:password@${host}/mash-ssm?authSource=mash-ssm`;
      await mongoose.connect(uri1);
      expect(mongoose.connection.readyState).toBe(1);
      await mongoose.disconnect();

      // Method 2: authSource in options (this is what app.module.ts does)
      const uri2 = `mongodb://mash-ssm:password@${host}/mash-ssm`;
      await mongoose.connect(uri2, { authSource: 'mash-ssm' });
      expect(mongoose.connection.readyState).toBe(1);
      await mongoose.disconnect();

      // Method 3: Wrong authSource in options (simulates the bug)
      const uri3 = `mongodb://mash-ssm:password@${host}/mash-ssm`;
      await expect(mongoose.connect(uri3, { authSource: 'admin' })).rejects.toThrow(
        /Authentication failed/,
      );
    });
  });

  describe('Pino MongoDB authSource Behavior', () => {
    it('should fail when pino-mongodb uses wrong authSource', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      const [hostname, port] = host.split(':');

      // Import pino dynamically to avoid module loading issues
      const pino = await import('pino');

      let connectionFailed = false;

      const transport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: `mongodb://${hostname}:${port}/`,
          database: 'logs',
          collection: 'app-logs',
          mongoOptions: {
            auth: {
              username: 'mash-ssm',
              password: 'password',
            },
            authSource: 'admin', // WRONG - user is in mash-ssm database
          },
        },
      });

      // Monitor for errors
      transport.on('error', (err) => {
        if (err.message.includes('Authentication failed')) {
          connectionFailed = true;
        }
      });

      const logger = pino.default(transport);

      // Try to log something
      logger.info('This should not work');

      // Wait for connection attempt
      await new Promise((resolve) => setTimeout(resolve, 3000));

      transport.end();

      expect(connectionFailed).toBe(true);
    });

    it('should work when pino-mongodb uses correct authSource', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      const [hostname, port] = host.split(':');

      const pino = await import('pino');

      const transport = pino.transport({
        target: 'pino-mongodb',
        options: {
          uri: `mongodb://${hostname}:${port}/`,
          database: 'logs',
          collection: 'app-logs',
          mongoOptions: {
            auth: {
              username: 'mash-ssm',
              password: 'password',
            },
            authSource: 'mash-ssm', // CORRECT
          },
        },
      });

      const logger = pino.default(transport);

      // Log a test message
      logger.info({ test: true }, 'Correct authSource test');

      // Wait for log to be written
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify log was written
      const client = new MongoClient(
        `mongodb://mash-ssm:password@${host}/logs?authSource=mash-ssm`,
      );

      await client.connect();
      const logs = await client.db('logs').collection('app-logs').find({}).toArray();

      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some((log) => log.msg === 'Correct authSource test')).toBe(true);

      await client.close();
      transport.end();
    });
  });

  describe('App Module Pattern Verification', () => {
    it('should demonstrate why hardcoding authSource breaks authentication', async () => {
      const baseUri = mongoServerAuth.getUri();
      const host = baseUri.replace('mongodb://', '').replace(/\/.*$/, '');
      const [hostname, port] = host.split(':');

      // Simulate the configuration from environment
      const db = {
        host: hostname,
        port: port,
        name: 'mash-ssm',
        user: 'mash-ssm',
        password: 'password',
        authSource: 'mash-ssm', // User's configuration
      };

      // BAD: Hardcoded authSource (the bug)
      const badMongooseOptions = {
        ...(db.user && db.password && { authSource: 'admin' }), // WRONG!
      };

      // GOOD: Using configured authSource (the fix)
      const goodMongooseOptions = {
        ...(db.user && db.password && { authSource: db.authSource }), // CORRECT!
      };

      // Test bad configuration
      const uriBad = `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}`;
      await expect(mongoose.connect(uriBad, badMongooseOptions)).rejects.toThrow(
        /Authentication failed/,
      );

      // Test good configuration
      const uriGood = `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}`;
      await mongoose.connect(uriGood, goodMongooseOptions);
      expect(mongoose.connection.readyState).toBe(1);
      await mongoose.disconnect();
    });
  });
});
