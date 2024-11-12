import { body, param, query } from 'express-validator';
import { SsmContainer } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

export const postBackupVolumeValidator = [
  param('uuid').exists().isUUID(),
  body('mode').exists().isIn(Object.values(SsmContainer.VolumeBackupMode)),
  validator,
];

export const getBackupVolumeValidator = [
  query('fileName').exists().isString().not().contains('..'),
  validator,
];
