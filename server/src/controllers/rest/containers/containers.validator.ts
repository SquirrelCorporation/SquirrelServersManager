import { body, param } from 'express-validator';
import { SsmContainer } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

export const postCustomNameOfContainerValidator = [
  param('id').exists().notEmpty().isString(),
  body('customName').exists().withMessage('customName in body is required').isString(),
  validator,
];

export const postDockerContainerActionValidator = [
  param('id').exists().notEmpty().isString(),
  param('action').exists().notEmpty().isString().isIn(Object.values(SsmContainer.Actions)),
  validator,
];

export const postProxmoxDockerContainerActionValidator = [
  param('uuid').exists().notEmpty().isUUID().isString(),
  param('action').exists().notEmpty().isString().isIn(Object.values(SsmContainer.Actions)),
  validator,
];
