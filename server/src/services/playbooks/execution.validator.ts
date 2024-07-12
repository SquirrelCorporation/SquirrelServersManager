import { param } from 'express-validator';
import validator from '../../middlewares/Validator';

export const execPlaybookValidator = [
  param('uuid').exists().notEmpty().isUUID().withMessage('Playbook uuid required'),
  validator,
];

export const execPlaybookByQuickRefValidator = [
  param('quickRef').exists().notEmpty().withMessage('Playbook quickRef required'),
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
