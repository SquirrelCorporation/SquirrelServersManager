import { validationResult } from 'express-validator';
import logger from '../logger';

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => e.msg);
    logger.error(errorMessages);
    return res.status(400).json({ success: false, message: errorMessages });
  }
  next();
};

export default validator;
