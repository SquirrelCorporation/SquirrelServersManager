import { param } from 'express-validator';
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
  param('type').exists().notEmpty().withMessage('Type is required'),
  validator,
];

export const getDeviceStatByDeviceUuidValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  param('type').exists().notEmpty().withMessage('Type is required'),
  validator,
];
