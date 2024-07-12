import { body, param } from 'express-validator';
import validator from '../../middlewares/Validator';

export const addOrUpdateExtraVarValueValidator = [
  param('varname').exists().notEmpty().withMessage('ExtraVar name required'),
  body('value').exists().notEmpty().withMessage('ExtraVar value required'),
  validator,
];
