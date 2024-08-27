import { body } from 'express-validator';
import validator from '../../../middlewares/Validator';

// section, key, value, description, deactivated
export const postConfValidator = [
  body('section').exists().notEmpty().isString(),
  body('key').exists().notEmpty().isString(),
  body('value').exists().notEmpty().isString(),
  body('description').optional().isString(),
  body('deactivated').optional().isBoolean(),
  validator,
];

export const deleteConfValidator = [
  body('section').exists().notEmpty().isString(),
  body('key').exists().notEmpty().isString(),
  validator,
];
