import { body, param } from 'express-validator';
import { playbookNameRegexp } from 'ssm-shared-lib/distribution/validation';
import validator from '../../middlewares/validator';

export const getPlaybookValidator = [
  param('playbook').exists().notEmpty().withMessage('Playbook name required'),
  validator,
];

export const editPlaybookValidator = [
  param('playbook').exists().notEmpty().withMessage('Playbook name required'),
  body('content').exists().notEmpty().withMessage('Content of playbook in body required'),
  validator,
];

export const addPlaybookValidator = [
  param('playbook')
    .exists()
    .notEmpty()
    .withMessage('Playbook name required')
    .matches(playbookNameRegexp)
    .withMessage('Forbidden characters in playbook name'),
  validator,
];

export const deletePlaybookValidator = [
  param('playbook')
    .exists()
    .notEmpty()
    .withMessage('Playbook name required')
    .blacklist('_')
    .withMessage('Cannot delete playbook with name that starts with _'),
  validator,
];

export const addExtraVarToPlaybookValidator = [
  param('playbook').exists().notEmpty().withMessage('Playbook name required'),
  body('extraVar').exists().notEmpty().withMessage('ExtraVar in body required'),
  validator,
];

export const deleteExtraVarFromPlaybookValidator = [
  param('playbook').exists().notEmpty().withMessage('Playbook name required'),
  param('varname').exists().notEmpty().withMessage('Varname name required'),
  validator,
];
