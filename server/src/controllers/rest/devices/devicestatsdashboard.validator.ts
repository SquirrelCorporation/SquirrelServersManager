import { body, param, query } from 'express-validator';
import { StatsType } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

export const getDashboardAveragedStatsValidator = [
  body('devices').exists().notEmpty().isArray().withMessage('Devices uuid in body required'),
  body('devices.*').isUUID().withMessage('Invalid uuid'),
  query('from').exists().notEmpty().isISO8601().withMessage('From in query is invalid'),
  query('to').exists().notEmpty().isISO8601().withMessage('From in query is invalid'),
  param('type')
    .exists()
    .notEmpty()
    .isIn(Object.values(StatsType.DeviceStatsType))
    .withMessage('Type is invalid'),
  validator,
];

export const getDashboardStatValidator = [
  body('devices').exists().notEmpty().isArray().withMessage('Devices uuid in body required'),
  body('devices.*').isUUID().withMessage('Invalid uuid'),
  query('from').exists().notEmpty().isISO8601().withMessage('From in query is invalid'),
  query('to').exists().notEmpty().isISO8601().withMessage('From in query is invalid'),
  param('type')
    .exists()
    .notEmpty()
    .isIn(Object.values(StatsType.DeviceStatsType))
    .withMessage('Type is invalid'),
  validator,
];
