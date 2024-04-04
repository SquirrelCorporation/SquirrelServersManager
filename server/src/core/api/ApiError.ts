import { Request, Response } from 'express';
import logger from '../../logger';
import {
  AuthFailureResponse,
  BadRequestResponse,
  ForbiddenResponse,
  InternalErrorResponse,
  NotFoundResponse,
} from './ApiResponse';

export enum ErrorType {
  UNAUTHORIZED = 'AuthFailureError',
  INTERNAL = 'InternalError',
  NOT_FOUND = 'NotFoundError',
  NO_ENTRY = 'NoEntryError',
  NO_DATA = 'NoDataError',
  BAD_REQUEST = 'BadRequestError',
  FORBIDDEN = 'ForbiddenError',
}

export abstract class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public message: string = 'error',
    public req?: Request,
  ) {
    super(type);
  }

  public static handle(err: ApiError, res: Response): Response {
    if (err.req) {
      logger.error(
        `[ERROR] - ${err?.req?.method} from ${err?.req?.url} - ${err.type} - ${err.message} - ${err?.req?.ip}`,
      );
    }
    switch (err.type) {
      case ErrorType.UNAUTHORIZED:
        return new AuthFailureResponse(err.message).send(res);
      case ErrorType.INTERNAL:
        return new InternalErrorResponse(err.message).send(res);
      case ErrorType.NOT_FOUND:
      case ErrorType.NO_ENTRY:
      case ErrorType.NO_DATA:
        return new NotFoundResponse(err.message).send(res);
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(err.message).send(res);
      case ErrorType.FORBIDDEN:
        return new ForbiddenResponse(err.message).send(res);
      default: {
        return new InternalErrorResponse(err.message).send(res);
      }
    }
  }
}

export class AuthFailureError extends ApiError {
  constructor(message = 'Invalid Credentials', req?: Request) {
    super(ErrorType.UNAUTHORIZED, message, req);
  }
}

export class InternalError extends ApiError {
  constructor(message = 'Internal error', req?: Request) {
    super(ErrorType.INTERNAL, message, req);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', req?: Request) {
    super(ErrorType.BAD_REQUEST, message, req);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found', req?: Request) {
    super(ErrorType.NOT_FOUND, message, req);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Permission denied', req?: Request) {
    super(ErrorType.FORBIDDEN, message, req);
  }
}

export class NoEntryError extends ApiError {
  constructor(message = "Entry don't exists", req?: Request) {
    super(ErrorType.NO_ENTRY, message, req);
  }
}

export class NoDataError extends ApiError {
  constructor(message = 'No data available', req?: Request) {
    super(ErrorType.NO_DATA, message, req);
  }
}
