import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Database utilities for integration testing
 */

let mongoMemoryServer: MongoMemoryServer | null = null;

/**
 * Initializes an in-memory MongoDB server for testing
 * @returns MongoDB connection URI
 */
export async function setupTestDatabase(): Promise<string> {
  // Create the in-memory MongoDB server if it doesn't exist
  if (!mongoMemoryServer) {
    mongoMemoryServer = await MongoMemoryServer.create();
  }
  
  const uri = mongoMemoryServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
  
  return uri;
}

/**
 * Clears all collections in the database but keeps the connection
 */
export async function clearDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    throw new Error('Database connection is not established');
  }
  
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

/**
 * Closes the MongoDB connection and stops the in-memory server
 */
export async function closeDatabase(): Promise<void> {
  if (mongoose.connection) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
}

/**
 * Seeds the database with initial test data
 * @param models Collection of model factories to use for seeding
 */
export async function seedDatabase(models: Record<string, any>): Promise<void> {
  for (const [modelName, modelData] of Object.entries(models)) {
    const model = mongoose.model(modelName);
    
    if (Array.isArray(modelData)) {
      await model.insertMany(modelData);
    } else {
      await model.create(modelData);
    }
  }
}