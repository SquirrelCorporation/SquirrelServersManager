import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import logger from '../logger';

const validator = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors.array());
    return res
      .status(400)
      .json({ success: false, message: JSON.stringify(errors.array().map((e) => e.msg)) });
  }
  next();
};

export default validator;
