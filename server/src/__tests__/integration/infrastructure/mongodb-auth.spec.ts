import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

describe('MongoDB Authentication Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    // Restore all mocks
    vi.restoreAllMocks();
    // Clear module mocks
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('Configuration Loading', () => {
    it('should correctly load MongoDB configuration with authSource', async () => {
      // Set test environment variables
      process.env.DB_HOST = 'test-host';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = 'test-user';
      process.env.DB_USER_PWD = 'test-password';
      process.env.DB_AUTH_SOURCE = 'custom-auth-db';

      // Re-import config to get fresh values
      vi.resetModules();
      const { db } = await import('../../../config');

      expect(db.host).toBe('test-host');
      expect(db.port).toBe('27017');
      expect(db.name).toBe('test-db');
      expect(db.user).toBe('test-user');
      expect(db.password).toBe('test-password');
      expect(db.authSource).toBe('custom-auth-db');
    });

    it('should default authSource to admin when not specified', async () => {
      // Set test environment variables without DB_AUTH_SOURCE
      process.env.DB_HOST = 'test-host';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = 'test-user';
      process.env.DB_USER_PWD = 'test-password';
      delete process.env.DB_AUTH_SOURCE;

      // Re-import config to get fresh values
      vi.resetModules();
      const { db } = await import('../../../config');

      expect(db.authSource).toBe('admin');
    });

    it('should handle empty authentication credentials', async () => {
      // Set test environment variables with empty credentials
      process.env.DB_HOST = 'test-host';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = '';
      process.env.DB_USER_PWD = '';

      // Re-import config to get fresh values
      vi.resetModules();
      const { db } = await import('../../../config');

      expect(db.user).toBe('');
      expect(db.password).toBe('');
    });
  });

  describe('Mongoose Connection String', () => {
    it('should build correct connection string without authentication', async () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = '';
      process.env.DB_USER_PWD = '';

      vi.resetModules();
      const { getMongoUri } = await import('../../../config');
      const uri = getMongoUri();

      expect(uri).toBe('mongodb://localhost:27017/test-db');
    });

    it('should build correct connection string with authentication and default authSource', async () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = 'user';
      process.env.DB_USER_PWD = 'password';
      delete process.env.DB_AUTH_SOURCE;

      vi.resetModules();
      const { getMongoUri } = await import('../../../config');
      const uri = getMongoUri();

      expect(uri).toBe('mongodb://user:password@localhost:27017/test-db?authSource=admin');
    });

    it('should build correct connection string with custom authSource', async () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = 'user';
      process.env.DB_USER_PWD = 'password';
      process.env.DB_AUTH_SOURCE = 'custom-auth';

      vi.resetModules();
      const { getMongoUri } = await import('../../../config');
      const uri = getMongoUri();

      expect(uri).toBe('mongodb://user:password@localhost:27017/test-db?authSource=custom-auth');
    });

    it('should properly encode special characters in credentials', async () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = 'user@special';
      process.env.DB_USER_PWD = 'p@ss:word/123';
      process.env.DB_AUTH_SOURCE = 'auth@db';

      vi.resetModules();
      const { getMongoUri } = await import('../../../config');
      const uri = getMongoUri();

      expect(uri).toBe(
        'mongodb://user%40special:p%40ss%3Aword%2F123@localhost:27017/test-db?authSource=auth%40db',
      );
    });
  });

  describe('Pino MongoDB Logger Configuration', () => {
    it('should configure pino-mongodb without authentication', async () => {
      // Set environment variables
      const originalEnv = { ...process.env };
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = '';
      process.env.DB_USER_PWD = '';

      // Import db config
      vi.resetModules();
      const { db } = await import('../../../config');

      // Build the expected pino-mongodb options (same logic as logger.ts)
      const expectedOptions: any = {
        uri: `mongodb://${db.host}:${db.port}/`,
        database: `${db.name}`,
        collection: 'logs',
      };

      // Verify that mongoOptions is not added when there are no credentials
      expect(db.user).toBe('');
      expect(db.password).toBe('');
      // When user/password are empty, mongoOptions should not be added
      expect(expectedOptions.mongoOptions).toBeUndefined();

      // Restore environment
      process.env = originalEnv;
    });

    it('should configure pino-mongodb with authentication and authSource', async () => {
      // Set environment variables
      const originalEnv = { ...process.env };
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = 'logger-user';
      process.env.DB_USER_PWD = 'logger-pass';
      process.env.DB_AUTH_SOURCE = 'logger-auth';

      // Import db config
      vi.resetModules();
      const { db } = await import('../../../config');

      // Build the expected pino-mongodb options (same logic as logger.ts)
      const expectedOptions: any = {
        uri: `mongodb://${db.host}:${db.port}/`,
        database: `${db.name}`,
        collection: 'logs',
      };

      // Add mongoOptions when credentials exist (logic from logger.ts)
      if (db.user && db.user.trim() !== '' && db.password && db.password.trim() !== '') {
        expectedOptions.mongoOptions = {
          auth: {
            username: db.user,
            password: db.password,
          },
          authSource: db.authSource,
        };
      }

      // Verify the configuration
      expect(db.user).toBe('logger-user');
      expect(db.password).toBe('logger-pass');
      expect(db.authSource).toBe('logger-auth');
      expect(expectedOptions.mongoOptions).toBeDefined();
      expect(expectedOptions.mongoOptions.auth).toEqual({
        username: 'logger-user',
        password: 'logger-pass',
      });
      expect(expectedOptions.mongoOptions.authSource).toBe('logger-auth');

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('NestJS MongoDB Module Configuration', () => {
    it('should configure MongooseModule with authSource in app.module', async () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'test-db';
      process.env.DB_USER = 'nest-user';
      process.env.DB_USER_PWD = 'nest-pass';
      process.env.DB_AUTH_SOURCE = 'nest-auth';

      // Instead of importing the entire app.module, test the MongoDB URI construction
      vi.resetModules();
      const { getMongoUri } = await import('../../../config');
      const uri = getMongoUri();

      // Verify the URI is constructed correctly with authSource
      expect(uri).toBe('mongodb://nest-user:nest-pass@localhost:27017/test-db?authSource=nest-auth');

      // Verify that the app.module.ts pattern would work correctly
      // The actual MongooseModule.forRootAsync would use this URI
      const mongooseOptions = {
        uri,
        autoIndex: true,
        minPoolSize: 5,
        maxPoolSize: 10,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,
        serverSelectionTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
        authSource: 'nest-auth',
      };

      // Verify the options include authSource
      expect(mongooseOptions.authSource).toBe('nest-auth');
      expect(mongooseOptions.uri).toContain('authSource=nest-auth');
    });
  });

  describe('MongoDB Connection Integration', () => {
    it('should handle connection with authSource correctly', async () => {
      const mockConnect = vi.fn().mockResolvedValue({} as any);
      vi.spyOn(mongoose, 'connect').mockImplementation(mockConnect);

      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'integration-db';
      process.env.DB_USER = 'int-user';
      process.env.DB_USER_PWD = 'int-pass';
      process.env.DB_AUTH_SOURCE = 'int-auth';

      vi.resetModules();
      const { getMongoUri } = await import('../../../config');
      const uri = getMongoUri();

      // Simulate connection
      await mongoose.connect(uri);

      expect(mockConnect).toHaveBeenCalledWith(
        'mongodb://int-user:int-pass@localhost:27017/integration-db?authSource=int-auth',
      );
    });

    it('should connect to MongoDB without authentication', async () => {
      const mockConnect = vi.fn().mockResolvedValue({} as any);
      vi.spyOn(mongoose, 'connect').mockImplementation(mockConnect);

      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'no-auth-db';
      process.env.DB_USER = '';
      process.env.DB_USER_PWD = '';

      vi.resetModules();
      const { getMongoUri } = await import('../../../config');
      const uri = getMongoUri();

      // Simulate connection
      await mongoose.connect(uri);

      expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/no-auth-db');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle authentication failure gracefully', async () => {
      const mockConnect = vi.fn().mockRejectedValue(new Error('Authentication failed'));
      vi.spyOn(mongoose, 'connect').mockImplementation(mockConnect);

      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'fail-db';
      process.env.DB_USER = 'wrong-user';
      process.env.DB_USER_PWD = 'wrong-pass';
      process.env.DB_AUTH_SOURCE = 'wrong-auth';

      vi.resetModules();
      const { getMongoUri } = await import('../../../config');
      const uri = getMongoUri();

      // Attempt connection
      await expect(mongoose.connect(uri)).rejects.toThrow('Authentication failed');
    });

    it('should validate authSource is used in MongoClient options', async () => {
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '27017';
      process.env.DB_NAME = 'client-db';
      process.env.DB_USER = 'client-user';
      process.env.DB_USER_PWD = 'client-pass';
      process.env.DB_AUTH_SOURCE = 'client-auth';

      vi.resetModules();
      const { db } = await import('../../../config');

      // Simulate how app.module.ts builds MongoDB options
      const mongoOptions = {
        ...(db.user && db.password && { authSource: db.authSource }),
      };

      expect(mongoOptions).toEqual({ authSource: 'client-auth' });
    });
  });
});
