/**
 * Custom main.js for E2E testing
 * This will replace the server's main.js during testing
 */
// @ts-nocheck
/* eslint-disable */
// This file is written as JavaScript with TypeScript annotations
// It will be placed directly into the dist folder
const reflectMetadata = require('reflect-metadata');
const app = require('./App').default;
const logger = require('./logger').default;
const { MongoClient } = require('mongodb');
const { initTestData } = require('./init-test-data');

const iApp = app;

const start = async () => {
  logger.info(`
    ,;;:;,
   ;;;;;
  ,:;;:;    ,'=.
  ;:;:;' .=" ,'_\\
  ':;:;,/  ,__:=@
   ';;:;  =./)_
     \`"=\\_  )_"\`
          \`\`'"\`
Starting SquirrelServersManager Test Server...`);

  try {
    // Initialize test data
    logger.info('Initializing test data...');
    const uri = process.env.MONGODB_URI || 'mongodb://mongo:27017/ssm-test';
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    
    await initTestData(db);
    await client.close();
    logger.info('Test data initialization complete');

    // Initialize NestJS (this will also set up Express routes)
    await iApp.setupNestJS();

    logger.info('Server started and ready for E2E tests');
  } catch (err) {
    logger.error(`Failed to start application: ${err.message}`);
    process.exit(1);
  }
};

// Always start the server in E2E test mode
start();

const restart = async () => {
  await iApp.stopServer(start);
};

const getApp = () => {
  return iApp.getApp();
};

module.exports = {
  restart,
  getApp
};