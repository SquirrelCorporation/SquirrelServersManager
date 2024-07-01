import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { SECRET } from './config';
import { connection } from './data/database';
import WatcherEngine from './integrations/docker/core/WatcherEngine';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';
import logger from './logger';
import Configuration from './core/startup';
import './middlewares/passport';
import Crons from './integrations/crons';
//const pino = require('pino-http')();

const app = express();

//app.use(pino);
app.use(express.json());

if (!SECRET) {
  throw new Error('No secret defined');
}
app.use(cookieParser());
app.use(passport.initialize());

let server: any;

const start = () => {
  logger.info(`Starting server...`);
  connection().then(async () => {
    await Configuration.init();
    app.use('/', routes);
    app.use(errorHandler);
    server = app.listen(3000, () =>
      logger.info(`
    🐿 Squirrel Servers Manager
    🚀 Server ready at: http://localhost:3000`),
    );
  });
};
start();

export const restart = async () => {
  await WatcherEngine.deregisterAll();
  Crons.stopAllScheduledJobs();
  server.close(() => {
    logger.info('Server is closed');
    logger.info('\n----------------- restarting -------------');
    start();
  });
};

/*process.on('uncaughtException', (err, origin) => {
  console.error('Unhandled exception. Please handle!', err.stack || err);
  console.error(`Origin: ${JSON.stringify(origin)}`);
});
*/
