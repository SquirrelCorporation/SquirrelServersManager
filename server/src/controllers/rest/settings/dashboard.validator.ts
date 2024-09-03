import { body, param } from 'express-validator';
import { SettingsKeys } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

export const postDashboardSettingsValidator = [
  param('key')
    .exists()
    .notEmpty()
    .withMessage('Key param is required')
    .isIn(Object.values(SettingsKeys.GeneralSettingsKeys))
    .withMessage('Unknown key'),
  body('value').exists().isNumeric().withMessage('Value must be numeric'),
  validator,
];
