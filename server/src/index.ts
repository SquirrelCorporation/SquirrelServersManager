import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import { SECRET } from './config';
import { ApiError, ErrorType, InternalError } from './core/api/ApiError';
import { connection } from './data/database';
import { findIpAddress } from './helpers/utils';
import routes from './routes';
import scheduledFunctions from './integrations/crons';
import logger from './logger';
import Configuration from './core/startup';
import './middlewares/passport';

//const pino = require('pino-http')();

const app = express();

//app.use(pino);
app.use(express.json());

if (!SECRET) {
  throw new Error('No secret defined');
}
app.use(cookieParser());
app.use(passport.initialize());

connection().then(async () => {
  await Configuration.needConfigurationInit();
  scheduledFunctions();
  app.use('/', routes);
  // Middleware Error Handler
  // TODO: move to middlewares
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
      ApiError.handle(err, res, req);
      if (err.type === ErrorType.INTERNAL) {
        logger.error(
          `[ERROR] 500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${findIpAddress(req)}`,
        );
      }
    } else {
      logger.error(
        `[ERROR] 500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${findIpAddress(req)}`,
      );
      logger.error(err);
      ApiError.handle(new InternalError(), res, req);
    }
  });
  app.listen(3000, () =>
    logger.info(`
    🐿 Squirrel Servers Manager
    🚀 Server ready at: http://localhost:3000`),
  );
});
