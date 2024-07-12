import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import pino from 'pino-http';
import { SECRET } from './config';
import { connection } from './data/database';
import WatcherEngine from './modules/docker/core/WatcherEngine';
import { errorHandler } from './middlewares/ErrorHandler';
import routes from './routes';
import logger from './logger';
import Configuration from './core/startup';
import './middlewares/Passport';
import Crons from './modules/crons';

const app = express();

app.use(
  pino({
    logger: logger.child({ module: 'REST' }, { msgPrefix: '[REST] - ' }),
    // Define a custom logger level
    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'silent';
      }
      return 'info';
    },
    // Define a custom success message
    customSuccessMessage: function (req, res) {
      return `${req.method} completed ${req.originalUrl}`;
    },

    // Define a custom receive message
    customReceivedMessage: function (req, res) {
      return `request received: ${req.method} - ${req.url}`;
    },

    // Define a custom error message
    customErrorMessage: function (req, res, err) {
      return 'request errored with status code: ' + res.statusCode;
    },
  }),
);
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
