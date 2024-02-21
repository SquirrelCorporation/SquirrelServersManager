import mongoose from 'mongoose';
import { AuthMechanism } from 'mongodb';
import { db } from '../config';
import logger from '../logger';

export const dbURI = `mongodb://mongo:${db.port}/${db.name}`;

async function connectMongoDb() {
  // Build the connection string

  const options = {
    autoIndex: true,
    minPoolSize: db.minPoolSize, // Maintain up to x socket connections
    maxPoolSize: db.maxPoolSize, // Maintain up to x socket connections
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  logger.info('[DATABASE] MongoDB - Connecting to ' + dbURI);

  function setRunValidators(this: any) {
    this.setOptions({ runValidators: true });
  }

  mongoose.set('strictQuery', true);

  // Create the database connection
  await mongoose
    .plugin((schema: any) => {
      schema.pre('findOneAndUpdate', setRunValidators);
      schema.pre('updateMany', setRunValidators);
      schema.pre('updateOne', setRunValidators);
      schema.pre('update', setRunValidators);
    })
    .connect(dbURI, options)
    .then(() => {
      logger.info('[DATABASE] Mongoose connection done');
    })
    .catch((e) => {
      logger.error('[DATABASE] Mongoose connection error');
      logger.error(e);
    });

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.on('connected', () => {
    logger.debug('[DATABASE] Mongoose default connection open to ' + dbURI);
  });

  // If the connection throws an error
  mongoose.connection.on('error', (err) => {
    logger.error('[DATABASE] Mongoose default connection error: ' + err);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    logger.info('[DATABASE] Mongoose default connection disconnected');
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    // @ts-ignore
    mongoose.connection.close(() => {
      logger.info('[DATABASE] Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
  return mongoose.connection;
}

export const connection = connectMongoDb;
