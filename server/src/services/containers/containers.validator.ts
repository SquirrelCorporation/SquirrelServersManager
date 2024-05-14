import { body, param } from 'express-validator';
import validator from '../../middlewares/validator';

export const postCustomNameOfContainerValidator = [
  param('id').exists().notEmpty().isString(),
  body('customName').exists().withMessage('customName in body is required').isString(),
  validator,
];
