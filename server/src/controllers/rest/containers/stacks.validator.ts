import { body, param } from 'express-validator';
import validator from '../../../middlewares/Validator';

export const postCustomStackValidator = [
  param('name').exists().isString(),
  body('json').optional().isObject().withMessage('Not a valid JSON'),
  body('yaml').optional().isString(),
  body('rawStackValue').optional().isArray().withMessage('Stack value is not a valid json'),
  validator,
];

export const patchCustomStackValidator = [
  param('uuid').exists().isUUID(),
  body('json').optional().isObject().withMessage('Not a valid JSON'),
  body('yaml').optional().isString(),
  body('rawStackValue').optional().isArray().withMessage('Stack value is not a valid json'),
  validator,
];

export const deleteCustomStackValidator = [param('uuid').exists().isUUID(), validator];

export const postDeployCustomStackValidator = [
  param('uuid').exists().isUUID(),
  body('target').exists().isString(),
  validator,
];
