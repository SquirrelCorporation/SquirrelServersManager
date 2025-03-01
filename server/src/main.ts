import app from './App';
import Startup from './core/startup';
import './middlewares/Passport';
import logger from './logger';
import WatcherEngine from './modules/containers/core/WatcherEngine';
import Crons from './modules/crons';
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

    // Initialize the application
    await Startup.init();

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
  await WatcherEngine.deregisterAll();
  Crons.stopAllScheduledJobs();
  await app.stopServer(start);
};

process.on('SIGINT', Telemetry.shutdown);
process.on('SIGTERM', Telemetry.shutdown);
