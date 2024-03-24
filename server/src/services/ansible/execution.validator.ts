import { param } from 'express-validator';
import validator from '../../middlewares/validator';

export const execPlaybookValidator = [
  param('playbook').exists().notEmpty().withMessage('Playbook required'),
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
