import MongoStore from 'connect-mongo';
import express from 'express';
import session from 'express-session';
import { SECRET, db } from './config';
import { connection } from './data/database';
import routes from './routes';
import scheduledFunctions from './integrations/crons';
import logger from './logger';
import Configuration from './core/startup';

//const pino = require('pino-http')();

const app = express();

//app.use(pino);
app.use(express.json());

if (!SECRET) {
  throw new Error('No secret defined');
}

app.use(
  session({
    secret: SECRET,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: MongoStore.create({
      // @ts-ignore
      clientPromise: connection().then((con) => con.getClient()),
      dbName: db.name,
      stringify: false,
      autoRemove: 'interval',
      autoRemoveInterval: 1,
    }),
  }),
);
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
