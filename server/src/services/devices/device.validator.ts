import { body, param } from 'express-validator';
import { SSHType } from '../../data/database/model/DeviceAuth';
import validator from '../../middlewares/validator';

export const addDeviceValidator = [
  body('ip')
    .exists()
    .notEmpty()
    .withMessage('Ip is required in body')
    .isIP()
    .withMessage('IP is invalid'),
  body('authType')
    .exists()
    .withMessage('authType in body is required')
    .isIn([SSHType.UserPassword, SSHType.KeyBased])
    .withMessage('authType is not in enum value SSHType'),
  body('sshPort').exists().notEmpty().isNumeric().withMessage('sshPort is not a number'),
  body('unManaged').optional().isBoolean().withMessage('unManaged is not a boolean'),
  body('masterNodeUrl')
    .optional()
    .isString()
    .isURL()
    .withMessage('Master node url is not correctly formatted'),
  body('sshKey').if(body('authType').equals(SSHType.KeyBased)).exists().notEmpty().isString(),
  body('sshUser').if(body('authType').equals(SSHType.UserPassword)).exists().notEmpty().isString(),
  body('sshPwd').if(body('authType').equals(SSHType.UserPassword)).exists().notEmpty().isString(),
  validator,
];

export const addDeviceAutoValidator = [
  body('ip')
    .exists()
    .notEmpty()
    .withMessage('Ip is required in body')
    .isIP()
    .withMessage('IP is invalid'),
  validator,
];

export const deleteDeviceValidator = [param('uuid').exists().notEmpty().isUUID(), validator];
