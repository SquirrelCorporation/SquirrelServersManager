import { body, param } from 'express-validator';
import { SSHType } from '../../data/database/model/DeviceAuth';
import validator from '../../middlewares/validator';

export const getDeviceAuthValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  validator,
];

export const addOrUpdateDeviceAuthValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  body('authType')
    .exists()
    .withMessage('authType in body is required')
    .isIn(Object.values(SSHType))
    .withMessage('authType is not in enum value SSHType'),
  body('sshPort').exists().notEmpty().isNumeric().withMessage('sshPort is not a number'),
  body('sshKey').if(body('authType').equals(SSHType.KeyBased)).exists().notEmpty().isString(),
  body('sshUser').if(body('authType').equals(SSHType.UserPassword)).exists().notEmpty().isString(),
  body('sshPwd').if(body('authType').equals(SSHType.UserPassword)).exists().notEmpty().isString(),
  validator,
];
