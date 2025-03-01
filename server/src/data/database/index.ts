import mongoose from 'mongoose';
import { isConnectionReady } from '../../app.module';
import { db } from '../../config';
import PinoLogger from '../../logger';

export const dbURI = `mongodb://${db.host}:${db.port}/${db.name}`;
const logger = PinoLogger.child({ module: 'Database' }, { msgPrefix: '[DATABASE] - ' });

/**
 * This function is now a wrapper that returns the global mongoose connection.
 * It's kept for backward compatibility with existing code that calls it.
 * The actual connection is established by NestJS in app.module.ts.
 */
async function connectMongoDb() {
  logger.info(`connectMongoDb - Using global mongoose connection (${dbURI})`);

  // If the connection isn't ready yet, wait for it
  if (!isConnectionReady()) {
    logger.info('Waiting for MongoDB connection to be ready...');

    // Wait for up to 10 seconds for the connection to be established
    for (let i = 0; i < 20; i++) {
      if (isConnectionReady()) {
        logger.info('MongoDB connection is now ready');
        break;
      }

      if (i === 19) {
        logger.warn('Timed out waiting for MongoDB connection to be ready');
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Return the global mongoose connection
  return mongoose.connection;
}

export const connection = connectMongoDb;
