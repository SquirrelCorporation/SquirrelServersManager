import { body, param } from 'express-validator';
import validator from '../../../middlewares/Validator';

export const addLocalRepositoryValidator = [
  body('name').exists().isString().withMessage('Name is incorrect'),
  validator,
];

export const updateLocalRepositoryValidator = [
  param('uuid').exists().isString().isUUID().withMessage('Uuid is incorrect'),
  body('name').exists().isString().withMessage('Name is incorrect'),
  validator,
];

export const genericActionLocalRepositoryValidator = [
  param('uuid').exists().isString().withMessage('Uuid is incorrect'),
  validator,
];
