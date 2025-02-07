import http from 'http';
import cookieParser from 'cookie-parser';
import express from 'express';
import passport from 'passport';
import pinoHttp from 'pino-http';
import { SECRET } from './config';
import EventManager from './core/events/EventManager';
import Events from './core/events/events';
import { deviceRegistry } from './data/statistics';
import logger, { httpLoggerOptions } from './logger';
import { errorHandler } from './middlewares/ErrorHandler';
import Socket from './middlewares/Socket';
import RealTime from './modules/real-time/RealTime';
import routes from './routes';

class AppWrapper extends EventManager {
  protected readonly app = express();
  private server!: http.Server;
  private socket!: Socket;
  private readonly refs: any = [];

  constructor() {
    super();
    this.refs.push(RealTime);
    this.setup();
  }

  public setup() {
    this.app.use(
      pinoHttp({
        logger: logger.child({ module: 'REST' }, { msgPrefix: '[REST] - ' }),
        ...httpLoggerOptions,
      }),
    );
    this.app.use(express.json({ limit: '50mb' }));
    if (!SECRET) {
      throw new Error('No secret defined');
    }
    this.app.use(cookieParser());
    this.app.use(passport.initialize());
  }

  public setupRoutes() {
    this.app.get('/metrics', async (_, res) => {
      res.setHeader('Content-Type', deviceRegistry.contentType);
      res.send(await deviceRegistry.metrics());
    });

    this.app.use('/', routes);
    this.app.use(errorHandler);
  }

  public startServer() {
    this.server = this.app.listen(3000, () =>
      logger.info(`
    🐿 Squirrel Servers Manager
    🚀 Server ready at: http://localhost:3000`),
    );
    this.socket = new Socket(this.server);
    this.emit(Events.APP_STARTED, 'App started');
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

  public getSocket() {
    return this.socket;
  }
}

export default new AppWrapper();
