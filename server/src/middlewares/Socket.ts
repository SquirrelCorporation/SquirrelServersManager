import http from 'http';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { NextFunction, Request, Response } from 'express';
import pino from 'pino';
import { Server, Socket as _Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { SsmEvents } from 'ssm-shared-lib';
import { SECRET } from '../config';
import UserRepo from '../data/database/repository/UserRepo';
import _logger from '../logger';
import { getContainerLogs } from '../services/socket/container-logs';
import { startSSHSession } from '../services/socket/ssh-session';

export type SSMSocket = _Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export type SSMSocketServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

const JWT_COOKIE_KEY = 'jwt';

export default class Socket {
  private readonly io!: Server;
  private logger: pino.Logger<never>;

  constructor(server: http.Server) {
    this.logger = _logger.child(
      {
        module: 'Socket',
      },
      { msgPrefix: '[SOCKET] - ' },
    );
    this.io = new Server(server);
    this.setup();
  }

  private setup() {
    this.logger.info('setting up socket');
    this.io.engine.use(this.authenticateSocketJWT);
    this.io.on('connection', this.registerSocketEvents);
    this.io.engine.on('connection_error', (err) => {
      this.logger.debug(err.req); // the request object
      this.logger.debug(err.code); // the error code, for example 1
      this.logger.debug(err.message); // the error message, for example "Session ID unknown"
      this.logger.debug(err.context); // some additional error context
    });
  }

  private registerSocketEvents = async (socket: SSMSocket) => {
    const io = this.io;
    socket.on(SsmEvents.Logs.GET_LOGS, getContainerLogs({ io, socket }));
    socket.on(SsmEvents.SSH.START_SESSION, startSSHSession({ io, socket }));
  };

  private authenticateSocketJWT = (req: Request, res: Response, next: NextFunction) => {
    const isHandshake = (req as Request & { _query: { sid: string } })._query.sid === undefined;
    if (isHandshake) {
      if (!req.headers?.cookie) {
        next();
      }
      const cookies = parse(req.headers.cookie as string);
      if (!cookies) {
        next();
      }
      const jwtCookie = cookies[JWT_COOKIE_KEY];
      if (!jwtCookie) {
        next();
      }
      this.verifyJWTAndFetchUser(jwtCookie, req, next);
    } else {
      next();
    }
  };

  private verifyJWTAndFetchUser(token: string, req: Request, next: NextFunction) {
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('invalid token'));
      }
      UserRepo.findByEmail((decoded as any).email).then((user) => {
        if (user) {
          req.user = user;
        }
        next();
      });
    });
  }

  public getIo() {
    return this.io;
  }
}
