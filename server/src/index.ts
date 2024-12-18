import { connection } from './data/database';
import WatcherEngine from './modules/containers/core/WatcherEngine';
import logger from './logger';
import Startup from './core/startup';
import './middlewares/Passport';
import Crons from './modules/crons';
import app from './App';
import Telemetry from './modules/telemetry';

const start = () => {
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
  connection().then(async () => {
    await Startup.init();
    app.setupRoutes();
    app.startServer();
  });
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export const restart = async () => {
  await WatcherEngine.deregisterAll();
  Crons.stopAllScheduledJobs();
  app.stopServer(start);
};

process.on('SIGINT', Telemetry.shutdown);
process.on('SIGTERM', Telemetry.shutdown);

/*process.on('uncaughtException', (err, origin) => {
  console.error('Unhandled exception. Please handle!', err.stack || err);
  console.error(`Origin: ${JSON.stringify(origin)}`);
});
*/
