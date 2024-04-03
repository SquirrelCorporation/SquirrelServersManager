import express from 'express';
import passport from 'passport';
import { SECRET } from './config';
import { connection } from './data/database';
import routes from './routes';
import scheduledFunctions from './integrations/crons';
import logger from './logger';
import Configuration from './core/startup';
import './middlewares/passport';
import cookieParser from 'cookie-parser';

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
  app.listen(3000, () =>
    logger.info(`
    🐿 Squirrel Servers Manager
    🚀 Server ready at: http://localhost:3000`),
  );
});
