import pino from 'pino';
import { db } from './config';

const transport = pino.transport({
  targets: [
    {
      options: {
        colorize: true,
      },
      target: 'pino-pretty', // must be installed separately
    },
    {
      target: 'pino-mongodb',
      options: {
        uri: `mongodb://${db.host}:${db.port}/`,
        database: `${db.name}`,
        collection: 'logs',
      },
    },
  ],
});

export const httpLoggerOptions = {
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
    return `Request completed: ${req.method} - ${(req as typeof req & { originalUrl: string }).originalUrl}`;
  },

  // Define a custom receive message
  customReceivedMessage: function (req, res) {
    return `Request received: ${req.method} - ${req.url}`;
  },

  // Define a custom error message
  customErrorMessage: function (req, res, err) {
    return `Request errored with status code: ${res.statusCode}`;
  },
};

export default pino(transport);
