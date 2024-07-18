import http from 'http';
import cookieParser from 'cookie-parser';
import express from 'express';
import passport from 'passport';
import pinoHttp from 'pino-http';
import { SECRET } from './config';
import logger, { httpLoggerOptions } from './logger';
import { errorHandler } from './middlewares/ErrorHandler';
import routes from './routes';

class AppWrapper {
  protected readonly app = express();
  private server?: http.Server;

  constructor() {
    this.setup();
  }

  public setup() {
    this.app.use(
      pinoHttp({
        logger: logger.child({ module: 'REST' }, { msgPrefix: '[REST] - ' }),
        ...httpLoggerOptions,
      }),
    );
    this.app.use(express.json());
    if (!SECRET) {
      throw new Error('No secret defined');
    }
    this.app.use(cookieParser());
    this.app.use(passport.initialize());
  }

  public setupRoutes() {
    this.app.use('/', routes);
    this.app.use(errorHandler);
  }

  public startServer() {
    this.server = this.app.listen(3000, () =>
      logger.info(`
    🐿 Squirrel Servers Manager
    🚀 Server ready at: http://localhost:3000`),
    );
  }

  public stopServer(callback: () => any) {
    this.server?.close(() => {
      logger.info('Server is closed');
      logger.info('\n----------------- restarting -------------');
      callback();
    });
  }

  public getExpressApp() {
    return this.app;
  }
}

export default new AppWrapper();
