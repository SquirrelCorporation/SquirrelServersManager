import { body, param } from 'express-validator';
import { GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import validator from '../../middlewares/validator';

export const postDeviceStatsSettingsValidator = [
  param('key')
    .exists()
    .notEmpty()
    .withMessage('Key param is required')
    .equals(GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS)
    .withMessage('Unknown key'),
  body('value').exists().isNumeric().withMessage('Value must be numeric'),
  validator,
];
