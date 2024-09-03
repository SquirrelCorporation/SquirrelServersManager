import { body, param } from 'express-validator';
import { SsmAnsible } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

export const getPlaybookValidator = [
  param('uuid').exists().notEmpty().isUUID().withMessage('Playbook uuid required'),
  validator,
];

export const editPlaybookValidator = [
  param('uuid').exists().notEmpty().isUUID().withMessage('Playbook uuid required'),
  body('content').exists().notEmpty().withMessage('Content of playbook in body required'),
  validator,
];

export const deletePlaybookValidator = [
  param('uuid').exists().notEmpty().isUUID().withMessage('Playbook uuid required'),
  validator,
];

export const addExtraVarToPlaybookValidator = [
  param('uuid').exists().notEmpty().isUUID().withMessage('Playbook uuid required'),
  body('extraVar').exists().notEmpty().withMessage('ExtraVar in body required'),
  body('extraVar.type')
    .exists()
    .notEmpty()
    .isIn(Object.values(SsmAnsible.ExtraVarsType))
    .withMessage('ExtraVar type is unknown'),
  body('extraVar.extraVar').exists().notEmpty().withMessage('ExtraVar name required'),
  validator,
];

export const deleteExtraVarFromPlaybookValidator = [
  param('uuid').exists().notEmpty().isUUID().withMessage('Playbook uuid required'),
  param('varname').exists().notEmpty().withMessage('Varname required'),
  validator,
];
