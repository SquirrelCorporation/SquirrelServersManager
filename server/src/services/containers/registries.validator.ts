import { body, param } from 'express-validator';
import validator from '../../middlewares/Validator';

export const updateRegistryValidator = [
  param('name').exists().isString(),
  body('auth').exists(),
  validator,
];

export const createCustomRegistryValidator = [
  param('name').exists().isString(),
  body('auth').exists(),
  body('authScheme').exists(),
  validator,
];

export const resetRegistryValidator = [param('name').exists().isString(), validator];

export const removeRegistryValidator = [param('name').exists().isString(), validator];
