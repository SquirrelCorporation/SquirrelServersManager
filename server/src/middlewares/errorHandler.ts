import { NextFunction, Request, Response } from 'express';
import { ApiError, ErrorType, InternalError } from '../core/api/ApiError';
import { findIpAddress } from '../helpers/utils';
import logger from '../logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res, req);
    if (err.type === ErrorType.INTERNAL) {
      logger.error(
        `[ERROR] 500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${findIpAddress(req)}`,
      );
    }
  } else {
    logger.error(
      `[ERROR] 500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${findIpAddress(req)}`,
    );
    logger.error(err);
    ApiError.handle(new InternalError(), res, req);
  }
};
