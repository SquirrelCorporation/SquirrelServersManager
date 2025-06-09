import pino from 'pino';
import { Options } from 'pino-http';
import { db } from './config';

// Build pino-mongodb options conditionally
const pinoMongoOptions: any = {
  uri: `mongodb://${db.host}:${db.port}/`,
  database: `${db.name}`,
  collection: 'logs',
};

// Only add mongoOptions if we have actual credentials (not empty strings)
if (db.user && db.user.trim() !== '' && db.password && db.password.trim() !== '') {
  pinoMongoOptions.mongoOptions = {
    auth: {
      username: db.user,
      password: db.password,
    },
    authSource: db.authSource,
  };
}

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
      options: pinoMongoOptions,
    },
  ],
});

export const httpLoggerOptions: Options = {
  // Define a custom logger level
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'debug';
  },
  // Define a custom success message
  customSuccessMessage: function (req, res) {
    return `Request completed (${res.statusCode}): ${req.method} - ${(req as typeof req & { originalUrl: string }).originalUrl}`;
  },

  // Define a custom receive message
  customReceivedMessage: function (req, res) {
    return `Request received: ${req.method} - ${req.url}`;
  },

  // Define a custom error message
  customErrorMessage: function (req, res, err) {
    return `Request errored with status code: ${res.statusCode} - ${req.method} - ${req.url} - ${err.message}`;
  },
};

export default pino(transport);
