import { NextFunction, Request, Response } from "express";
import { ApiError, InternalError } from "./ApiError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res, req);
  } else {
    ApiError.handle(new InternalError(), res, req);
  }
};
