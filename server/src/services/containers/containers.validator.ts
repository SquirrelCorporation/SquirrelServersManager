import { body, param } from 'express-validator';
import { SsmContainer } from 'ssm-shared-lib';
import validator from '../../middlewares/validator';

export const postCustomNameOfContainerValidator = [
  param('id').exists().notEmpty().isString(),
  body('customName').exists().withMessage('customName in body is required').isString(),
  validator,
];

export const postContainerActionValidator = [
  param('id').exists().notEmpty().isString(),
  param('action').exists().notEmpty().isString().isIn(Object.values(SsmContainer.Actions)),
  validator,
];
