import { NextFunction, Request, Response } from 'express';
import PinoLogger from '../logger';
import { ApiError, AuthFailureError, InternalError } from './api/ApiError';

const logger = PinoLogger.child({ module: 'ErrorHandler' }, { msgPrefix: '[ERROR] - ' });

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res, req);
  } else {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (err.message === 'Unauthorized') {
      ApiError.handle(new AuthFailureError('Unauthorized'), res, req);
      return;
    }
    ApiError.handle(new InternalError(), res, req);
  }
};
