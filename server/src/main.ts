import app from './App';
import logger from './logger';
import Telemetry from './modules/telemetry';

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
Starting Squirrel Servers Manager server...`);

  try {
    // Initialize NestJS (this will also set up Express routes)
    await app.setupNestJS();

    // Start the server
    await app.startServer();
  } catch (err: any) {
    logger.error(`Failed to start application: ${err.message}`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  void start();
}

export const restart = async () => {
  await app.stopServer(start);
};

process.on('SIGINT', Telemetry.shutdown);
process.on('SIGTERM', Telemetry.shutdown);
