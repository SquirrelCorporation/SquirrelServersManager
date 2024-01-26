import express from 'express';
import { connection } from './database';
import routes from './controlers';
import scheduledFunctions from './crons';
import logger from './logger';

const app = express();

app.use(express.json());

app.use('/', routes);

connection().then(() => {
  scheduledFunctions();
  const server = app.listen(3000, () =>
    logger.info(`
    🐿 Squirrel Servers Manager
    🚀 Server ready at: http://localhost:3000
    ⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`),
  );
});
