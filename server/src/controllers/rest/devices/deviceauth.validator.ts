import { body, param } from 'express-validator';
import { SsmAnsible, Validation } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

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
    .isIn(Object.values(SsmAnsible.SSHType))
    .withMessage('authType is not in enum value SSHType'),
  body('sshPort').exists().notEmpty().isNumeric().withMessage('sshPort is not a number'),
  body('sshKey')
    .if(body('authType').equals(SsmAnsible.SSHType.KeyBased))
    .exists()
    .notEmpty()
    .isString()
    .matches(Validation.privateKeyRegexp),
  body('sshUser')
    .if(body('authType').equals(SsmAnsible.SSHType.KeyBased))
    .exists()
    .notEmpty()
    .isString(),
  body('sshUser')
    .if(body('authType').isIn([SsmAnsible.SSHType.UserPassword, SsmAnsible.SSHType.Automatic]))
    .exists()
    .notEmpty()
    .isString(),
  body('sshPwd')
    .if(body('authType').equals(SsmAnsible.SSHType.UserPassword))
    .exists()
    .notEmpty()
    .isString(),
  body('becomeMethod')
    .exists()
    .notEmpty()
    .isIn(Object.values(SsmAnsible.AnsibleBecomeMethod))
    .withMessage('becomeMethod is not supported'),
  body('sshConnection')
    .if(body('authType').equals(SsmAnsible.SSHType.Automatic))
    .isIn([SsmAnsible.SSHConnection.BUILTIN, undefined])
    .withMessage('sshConnection must be "ssh" for automatic authentication'),
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
    .isIn(Object.values(SsmAnsible.SSHType))
    .withMessage('authType is not in enum value SSHType'),
  body('dockerCustomSshUser').optional().isString(),
  body('dockerCustomSshPwd').optional().isString(),
  body('dockerCustomSshKeyPass').optional().isString(),
  body('dockerCustomSshKey').optional().isString().matches(Validation.privateKeyRegexp),
  body('customDockerForcev6').optional().isBoolean(),
  body('customDockerForcev4').optional().isBoolean(),
  body('customDockerAgentForward').optional().isBoolean(),
  body('customDockerTryKeyboard').optional().isBoolean(),
  validator,
];
