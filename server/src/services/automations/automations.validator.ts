import { body, param } from 'express-validator';
import validator from '../../middlewares/Validator';

export const putAutomationValidator = [
  param('name').exists().isString(),
  body('rawChain').exists().notEmpty().withMessage('rawChain is required in body'),
  validator,
];

export const postAutomationValidator = [
  param('uuid').exists().isString().isUUID(),
  body('name').exists().isString(),
  body('rawChain').exists().notEmpty().withMessage('rawChain is required in body'),
  validator,
];

export const deleteAutomationValidator = [param('uuid').exists().isString().isUUID(), validator];

export const manualAutomationExecutionValidator = [
  param('uuid').exists().isString().isUUID(),
  validator,
];
