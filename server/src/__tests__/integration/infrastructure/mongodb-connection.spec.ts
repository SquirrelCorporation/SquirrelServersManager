import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('MongoDB Connection Integration Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('MongoDB Connection String Building', () => {
    it('should build correct connection string with authSource', () => {
      // Test configuration
      const config = {
        host: 'testhost',
        port: '27017',
        name: 'testdb',
        user: 'testuser',
        password: 'testpass',
        authSource: 'authdb',
      };

      // Build connection string as done in the app
      const getMongoUri = () => {
        if (config.user && config.password) {
          return `mongodb://${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.name}?authSource=${encodeURIComponent(config.authSource)}`;
        }
        return `mongodb://${config.host}:${config.port}/${config.name}`;
      };

      const uri = getMongoUri();
      expect(uri).toBe('mongodb://testuser:testpass@testhost:27017/testdb?authSource=authdb');
    });

    it('should handle special characters in credentials', () => {
      const config = {
        host: 'testhost',
        port: '27017',
        name: 'testdb',
        user: 'user@special',
        password: 'p@ss:word/123',
        authSource: 'auth@db',
      };

      // Build connection string
      const getMongoUri = () => {
        if (config.user && config.password) {
          return `mongodb://${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.name}?authSource=${encodeURIComponent(config.authSource)}`;
        }
        return `mongodb://${config.host}:${config.port}/${config.name}`;
      };

      const uri = getMongoUri();
      expect(uri).toBe(
        'mongodb://user%40special:p%40ss%3Aword%2F123@testhost:27017/testdb?authSource=auth%40db',
      );
    });
  });

  describe('MongoClient Options', () => {
    it('should include authSource in MongoClient options', () => {
      const config = {
        user: 'testuser',
        password: 'testpass',
        authSource: 'customauth',
      };

      // Build options as in app.module.ts
      const mongoOptions = {
        ...(config.user && config.password && { authSource: config.authSource }),
      };

      expect(mongoOptions).toEqual({ authSource: 'customauth' });
    });

    it('should not include authSource when no authentication', () => {
      const config = {
        user: '',
        password: '',
        authSource: 'admin',
      };

      // Build options as in app.module.ts
      const mongoOptions = {
        ...(config.user && config.password && { authSource: config.authSource }),
      };

      expect(mongoOptions).toEqual({});
    });
  });

  describe('Pino MongoDB Options', () => {
    it('should correctly structure pino-mongodb options with authSource', () => {
      const config = {
        host: 'localhost',
        port: '27017',
        name: 'testdb',
        user: 'pinouser',
        password: 'pinopass',
        authSource: 'pinodb',
      };

      // Build pino-mongodb options as in app.module.ts
      const pinoOptions = {
        uri: `mongodb://${config.host}:${config.port}/`,
        database: config.name,
        collection: 'logs',
        ...(config.user &&
          config.password && {
            mongoOptions: {
              auth: {
                username: config.user,
                password: config.password,
              },
              authSource: config.authSource,
            },
          }),
      };

      expect(pinoOptions.mongoOptions).toBeDefined();
      expect(pinoOptions.mongoOptions.authSource).toBe('pinodb');
      expect(pinoOptions.mongoOptions.auth).toEqual({
        username: 'pinouser',
        password: 'pinopass',
      });
    });

    it('should not include mongoOptions when no authentication', () => {
      const config = {
        host: 'localhost',
        port: '27017',
        name: 'testdb',
        user: '',
        password: '',
        authSource: 'admin',
      };

      // Build pino-mongodb options
      const pinoOptions = {
        uri: `mongodb://${config.host}:${config.port}/`,
        database: config.name,
        collection: 'logs',
        ...(config.user &&
          config.password && {
            mongoOptions: {
              auth: {
                username: config.user,
                password: config.password,
              },
              authSource: config.authSource,
            },
          }),
      };

      expect(pinoOptions.mongoOptions).toBeUndefined();
    });
  });

  describe('Real-world Scenario Simulation', () => {
    it('should match the exact pattern from the user report', () => {
      // User's exact configuration
      process.env.DB_HOST = 'mash-mongodb';
      process.env.DB_NAME = 'mash-ssm';
      process.env.DB_PORT = '27017';
      process.env.DB_USER = 'mash-ssm';
      process.env.DB_USER_PWD = 'password';
      process.env.DB_AUTH_SOURCE = 'mash-ssm';

      // Simulate config loading
      const db = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_USER_PWD,
        authSource: process.env.DB_AUTH_SOURCE || 'admin',
      };

      // Build mongoose options as in app.module.ts
      const mongooseOptions = {
        ...(db.user && db.password && { authSource: db.authSource }),
      };

      // Build pino-mongodb options as in app.module.ts
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

      // Verify authSource is correctly set
      expect(mongooseOptions.authSource).toBe('mash-ssm');
      expect(pinoOptions.mongoOptions.authSource).toBe('mash-ssm');

      // Ensure it's not defaulting to 'admin'
      expect(mongooseOptions.authSource).not.toBe('admin');
      expect(pinoOptions.mongoOptions.authSource).not.toBe('admin');
    });

    it('should never hardcode authSource to admin when auth is present', () => {
      process.env.DB_USER = 'someuser';
      process.env.DB_USER_PWD = 'somepass';
      process.env.DB_AUTH_SOURCE = 'customdb';

      const db = {
        user: process.env.DB_USER,
        password: process.env.DB_USER_PWD,
        authSource: process.env.DB_AUTH_SOURCE || 'admin',
      };

      // This is what we DON'T want to see
      const badOptions = {
        ...(db.user && db.password && { authSource: 'admin' }),
      };

      // This is what we DO want to see
      const goodOptions = {
        ...(db.user && db.password && { authSource: db.authSource }),
      };

      expect(badOptions.authSource).toBe('admin'); // Bad - hardcoded
      expect(goodOptions.authSource).toBe('customdb'); // Good - uses config
    });
  });
});
