import { connection } from './data/database';
import WatcherEngine from './modules/docker/core/WatcherEngine';
import logger from './logger';
import Configuration from './core/startup';
import './middlewares/Passport';
import Crons from './modules/crons';
import app from './App';

const start = () => {
  logger.info(`Starting server...`);
  connection().then(async () => {
    await Configuration.init();
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

/*process.on('uncaughtException', (err, origin) => {
  console.error('Unhandled exception. Please handle!', err.stack || err);
  console.error(`Origin: ${JSON.stringify(origin)}`);
});
*/
