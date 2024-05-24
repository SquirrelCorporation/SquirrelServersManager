import { param } from 'express-validator';
import { ContainerStatsType, DeviceStatsType } from 'ssm-shared-lib/distribution/enums/stats';
import validator from '../../middlewares/validator';

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
  param('type').exists().notEmpty().isIn(Object.values(DeviceStatsType)).withMessage('Type is required'),
  validator,
];

export const getDeviceStatByDeviceUuidValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  param('type').exists().notEmpty().isIn(Object.values(DeviceStatsType)).withMessage('Type is required'),
  validator,
];
