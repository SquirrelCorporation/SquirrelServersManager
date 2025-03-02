import { Server as HttpServer } from 'http';
import { Injectable } from '@nestjs/common';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { NextFunction, Request, Response } from 'express';
import { Server, Socket as _Socket } from 'socket.io';
import logger from '../logger';

// Define the Socket type
export type Socket = _Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

@Injectable()
export default class Socket {
  private io: Server | null = null;

  constructor(server: HttpServer) {
    // Legacy Socket.IO server is completely disabled
    // All WebSocket communication is now handled by NestJS WebSocket gateways
    logger.info('Legacy Socket.IO server is disabled. Using NestJS WebSocket gateways instead.');
  }

  // Keep the middleware for backward compatibility
  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // No-op middleware
      next();
    };
  }
}
