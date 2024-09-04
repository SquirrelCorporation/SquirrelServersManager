import { body, param } from 'express-validator';
import { SsmAnsible } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

export const execPlaybookValidator = [
  param('uuid').exists().notEmpty().isUUID().withMessage('Playbook uuid required'),
  body('mode')
    .default(SsmAnsible.ExecutionMode.APPLY)
    .isIn(Object.values(SsmAnsible.ExecutionMode))
    .withMessage('Playbook mode unknown'),
  validator,
];

export const execPlaybookByQuickRefValidator = [
  param('quickRef').exists().notEmpty().withMessage('Playbook quickRef required'),
  body('mode')
    .default(SsmAnsible.ExecutionMode.APPLY)
    .isIn(Object.values(SsmAnsible.ExecutionMode))
    .withMessage('Playbook mode unknown'),
  validator,
];
export const getLogsValidator = [
  param('id').exists().notEmpty().withMessage('Exec Id required'),
  validator,
];

export const getStatusValidator = [
  param('id').exists().notEmpty().withMessage('Exec Id required'),
  validator,
];
