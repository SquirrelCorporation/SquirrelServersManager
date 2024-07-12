import { NextFunction, Request, Response } from 'express';
import PinoLogger from '../logger';
import { ApiError, InternalError } from './api/ApiError';

const logger = PinoLogger.child({ module: 'ErrorHandler' }, { msgPrefix: '[ERROR] - ' });

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res, req);
  } else {
    logger.error(err);
    ApiError.handle(new InternalError(), res, req);
  }
};
