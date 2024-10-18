import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, vi } from 'vitest';

beforeAll(async () => {
  vi.mock('../../logger', async (importOriginal) => {
    return {
      ...(await importOriginal<typeof import('../../logger')>()),
    };
  });

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  (global as any).__MONGOINSTANCE = mongod;
  process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
  const conn = await mongoose.connect(`${process.env.MONGO_URI}`);
  await conn.connection?.db?.dropDatabase();
  await mongoose.disconnect();
}, 50000);

afterAll(async () => {
  const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
  await instance.stop();
}, 50000);
