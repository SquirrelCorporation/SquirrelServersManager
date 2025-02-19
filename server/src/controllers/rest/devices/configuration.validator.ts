import { body, param } from 'express-validator';
import validator from '../../../middlewares/Validator';

export const postDeviceProxmoxConfigurationValidator = [
  param('uuid').exists().notEmpty().isUUID(),
  body('watcherCron')
    .exists()
    .withMessage('watcherCron is required.')
    .isString()
    .withMessage('watcherCron must be a string.'),
  validator,
];

export const postDeviceSystemInformationConfigurationValidator = [
  param('uuid').exists().notEmpty().isUUID(),
  body('*.*.watch')
    .exists()
    .withMessage('Watch is required.')
    .isBoolean()
    .withMessage('Watch must be a boolean.'),
  body('*.*.cron')
    .exists()
    .withMessage('Cron is required.')
    .isString()
    .withMessage('Cron must be a boolean.'),
  validator,
];
