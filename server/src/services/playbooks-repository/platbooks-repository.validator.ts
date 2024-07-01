import { body, param } from 'express-validator';
import validator from '../../middlewares/validator';

export const addDirectoryToPlaybookRepositoryValidator = [
  param('uuid').exists().isString().isUUID().withMessage('Uuid is incorrect'),
  param('directoryName').exists().isString().withMessage('Name is incorrect'),
  body('fullPath').exists().isString().not().contains('..').withMessage('path is incorrect'),
  validator,
];

export const addPlaybookToRepositoryValidator = [
  param('uuid').exists().isString().isUUID().withMessage('Uuid is incorrect'),
  param('playbookName').exists().isString().withMessage('Name is incorrect'),
  body('fullPath').exists().isString().not().contains('..').withMessage('path is incorrect'),
  validator,
];

export const deleteAnyFromRepositoryValidator = [
  param('uuid').exists().isString().isUUID().withMessage('Uuid is incorrect'),
  body('fullPath').exists().isString().not().contains('..').withMessage('path is incorrect'),
  validator,
];
