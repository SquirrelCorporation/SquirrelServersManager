import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

/**
 * Creates an in-memory MongoDB server for testing
 */
export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) => {
  return MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });
};

/**
 * Closes the in-memory MongoDB connection
 */
export const closeInMongodConnection = async () => {
  if (mongod) {
    await mongod.stop();
  }
};

/**
 * Creates a mock service with methods that return mocked responses
 */
export const createMockService = (methods: Record<string, any>) => {
  return Object.keys(methods).reduce((acc, method) => {
    acc[method] = vi.fn().mockImplementation(methods[method]);
    return acc;
  }, {});
};