import pino from 'pino';
import { db } from './config';

const transport = pino.transport({
  targets: [{
    options: {
      colorize: true
    },
    target: 'pino-pretty' // must be installed separately
  },
    {
    target: 'pino-mongodb',
      options: {
        uri: `mongodb://mongo:${db.port}/`,
        database: `${db.name}`,
        collection: 'logs',
      }
  }]
});

export default pino(transport);
