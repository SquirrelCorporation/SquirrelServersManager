import { body, param } from 'express-validator';
import { AnsibleBecomeMethod, SSHType } from 'ssm-shared-lib/distribution/enums/ansible';
import { privateKeyRegexp } from 'ssm-shared-lib/distribution/validation';
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
  body('sshKey')
    .if(body('authType').equals(SSHType.KeyBased))
    .exists()
    .notEmpty()
    .isString()
    .matches(privateKeyRegexp),
  body('sshUser').if(body('authType').equals(SSHType.KeyBased)).exists().notEmpty().isString(),
  body('sshUser').if(body('authType').equals(SSHType.UserPassword)).exists().notEmpty().isString(),
  body('sshPwd').if(body('authType').equals(SSHType.UserPassword)).exists().notEmpty().isString(),
  body('becomeMethod')
    .exists()
    .notEmpty()
    .isIn(Object.values(AnsibleBecomeMethod))
    .withMessage('becomeMethod is not supported'),
  validator,
];

export const updateDockerAuthValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  body('customDockerSSH').optional().isBoolean(),
  body('dockerCustomAuthType')
    .optional()
    .isIn(Object.values(SSHType))
    .withMessage('authType is not in enum value SSHType'),
  body('dockerCustomSshUser').optional().isString(),
  body('dockerCustomSshPwd').optional().isString(),
  body('dockerCustomSshKeyPass').optional().isString(),
  body('dockerCustomSshKey').optional().isString().matches(privateKeyRegexp),
  body('customDockerForcev6').optional().isBoolean(),
  body('customDockerForcev4').optional().isBoolean(),
  body('customDockerAgentForward').optional().isBoolean(),
  body('customDockerTryKeyboard').optional().isBoolean(),
  validator,
];
