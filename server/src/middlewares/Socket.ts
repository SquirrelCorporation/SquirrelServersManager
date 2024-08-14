import http from 'http';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { NextFunction, Request, Response } from 'express';
import pino from 'pino';
import { Server, Socket as _Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { SECRET } from '../config';
import UserRepo from '../data/database/repository/UserRepo';
import _logger from '../logger';
import { getContainerLogs } from '../services/socket/container-logs';
import { startSSHSession } from '../services/socket/ssh-session';

export type SSMSocket = _Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export type SSMSocketServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

export default class Socket {
  private readonly io!: Server;
  private logger: pino.Logger<never>;

  constructor(server: http.Server) {
    this.logger = _logger.child(
      {
        module: `Socket`,
      },
      { msgPrefix: '[SOCKET] - ' },
    );
    this.io = new Server(server);
    this.setup();
  }

  private setup() {
    this.logger.info('setting up socket');
    this.io.engine.use(this.socketJWT);

    this.io.on('connection', async (socket) => {
      const io = this.io;
      socket.on('logs:getLogs', getContainerLogs({ io, socket }));
      socket.on('ssh:start', startSSHSession({ io, socket }));
    });
    this.io.engine.on('connection_error', (err) => {
      this.logger.debug(err.req); // the request object
      this.logger.debug(err.code); // the error code, for example 1
      this.logger.debug(err.message); // the error message, for example "Session ID unknown"
      this.logger.debug(err.context); // some additional error context
    });
  }

  private socketJWT = (req: Request, res: Response, next: NextFunction) => {
    // @ts-expect-error must complete the req type
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      if (!req.headers?.cookie) {
        next();
      }
      const cookies = parse(req.headers.cookie as string);
      if (!cookies) {
        next();
      }
      const jwtCookie = cookies['jwt'];
      if (!jwtCookie) {
        next();
      }
      jwt.verify(jwtCookie, SECRET, (err, decoded) => {
        if (err) {
          return next(new Error('invalid token'));
        }
        // @ts-expect-error must complete the req type
        UserRepo.findByEmail(decoded.email).then((user) => {
          if (user) {
            req.user = user;
          }
        });
        next();
      });
    } else {
      next();
    }
  };
}
