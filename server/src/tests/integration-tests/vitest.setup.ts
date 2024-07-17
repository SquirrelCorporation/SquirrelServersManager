import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';

let mongod: any;

beforeAll(async () => {
  vi.mock('../../logger', async (importOriginal) => {
    return {
      ...(await importOriginal<typeof import('../../logger')>()),
    };
  });
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}, 50000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await (mongod as MongoMemoryServer).stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];

    await collection.deleteMany();
  }
});
