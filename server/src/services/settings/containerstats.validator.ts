import { body, param } from 'express-validator';
import { GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import validator from '../../middlewares/validator';

export const postContainerStatsSettingsValidator = [
  param('key')
    .exists()
    .notEmpty()
    .withMessage('Key param is required')
    .equals(GeneralSettingsKeys.CONTAINER_STATS_RETENTION_IN_DAYS)
    .withMessage('Unknown key'),
  body('value').exists().isNumeric().withMessage('Value must be numeric'),
  validator,
];
