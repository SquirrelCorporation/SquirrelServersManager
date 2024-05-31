import { body, param } from 'express-validator';
import { GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import validator from '../../middlewares/validator';

export const postDashboardSettingsValidator = [
  param('key')
    .exists()
    .notEmpty()
    .withMessage('Key param is required')
    .isIn(Object.values(GeneralSettingsKeys))
    .withMessage('Unknown key'),
  body('value').exists().isNumeric().withMessage('Value must be numeric'),
  validator,
];
