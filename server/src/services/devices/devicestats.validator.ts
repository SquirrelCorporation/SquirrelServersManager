import { param } from 'express-validator';
import { StatsType } from 'ssm-shared-lib';
import validator from '../../middlewares/Validator';

export const updateDeviceAndAddDeviceStatValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  validator,
];

export const getDeviceStatsByDeviceUuidValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  param('type')
    .exists()
    .notEmpty()
    .isIn(Object.values(StatsType.DeviceStatsType))
    .withMessage('Type is required'),
  validator,
];

export const getDeviceStatByDeviceUuidValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  param('type')
    .exists()
    .notEmpty()
    .isIn(Object.values(StatsType.DeviceStatsType))
    .withMessage('Type is required'),
  validator,
];
