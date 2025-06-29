import 'reflect-metadata';
import { version } from '../package.json';
import app from './App';
import logger from './logger';

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
Starting Squirrel Servers Manager server ($${version})...`);

  try {
    // Initialize NestJS (this will also set up Express routes)
    await iApp.setupNestJS();

    // Start the server
  } catch (err: any) {
    logger.error(`Failed to start application: ${err.message}`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  void start();
}

export const restart = async () => {
  await iApp.stopServer(start);
};

export const getApp = () => {
  return iApp.getApp();
};
