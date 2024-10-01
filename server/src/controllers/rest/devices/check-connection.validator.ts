import { body, param } from 'express-validator';
import { SsmAnsible } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

export const postCheckAnsibleConnectionValidator = [
  body('ip')
    .exists()
    .notEmpty()
    .withMessage('Ip is required in body')
    .isIP()
    .withMessage('IP is invalid'),
  body('sshConnection')
    .exists()
    .withMessage('sshConnection in body is required')
    .isIn(Object.values(SsmAnsible.SSHConnection))
    .withMessage('sshConnection is not in enum value SSHConnection')
    .if(body('authType').equals(SsmAnsible.SSHType.PasswordLess))
    .isIn([SsmAnsible.SSHConnection.BUILTIN])
    .withMessage('sshConnection must be ssh with passwordless authentication'),
  body('authType')
    .exists()
    .withMessage('authType in body is required')
    .isIn([
      SsmAnsible.SSHType.UserPassword,
      SsmAnsible.SSHType.KeyBased,
      SsmAnsible.SSHType.PasswordLess,
    ])
    .withMessage('authType is not in enum value SSHType'),
  body('sshPort').exists().notEmpty().isNumeric().withMessage('sshPort is not a number'),
  body('unManaged').optional().isBoolean().withMessage('unManaged is not a boolean'),
  body('masterNodeUrl')
    .optional()
    .isString()
    .isURL({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
    .withMessage('Master node url is not correctly formatted'),
  body('sshKey')
    .if(body('authType').equals(SsmAnsible.SSHType.KeyBased))
    .exists()
    .notEmpty()
    .isString(),
  body('sshUser')
    .if(body('authType').isIn([SsmAnsible.SSHType.UserPassword, SsmAnsible.SSHType.PasswordLess]))
    .exists()
    .notEmpty()
    .isString(),
  body('sshPwd')
    .if(body('authType').equals(SsmAnsible.SSHType.UserPassword))
    .exists()
    .notEmpty()
    .isString(),
  validator,
];

export const postCheckDockerConnectionValidator = [
  body('ip')
    .exists()
    .notEmpty()
    .withMessage('Ip is required in body')
    .isIP()
    .withMessage('IP is invalid'),
  body('authType')
    .exists()
    .withMessage('authType in body is required')
    .isIn([
      SsmAnsible.SSHType.UserPassword,
      SsmAnsible.SSHType.KeyBased,
      SsmAnsible.SSHType.PasswordLess,
    ])
    .withMessage('authType is not in enum value SSHType'),
  body('sshPort').exists().notEmpty().isNumeric().withMessage('sshPort is not a number'),
  body('sshKey')
    .if(body('authType').equals(SsmAnsible.SSHType.KeyBased))
    .exists()
    .notEmpty()
    .isString(),
  body('sshUser')
    .if(body('authType').isIn([SsmAnsible.SSHType.UserPassword, SsmAnsible.SSHType.PasswordLess]))
    .exists()
    .notEmpty()
    .isString(),
  body('sshPwd')
    .if(body('authType').equals(SsmAnsible.SSHType.UserPassword))
    .exists()
    .notEmpty()
    .isString(),
  validator,
];

export const getCheckDeviceDockerConnectionValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  validator,
];

export const getCheckDeviceAnsibleConnectionValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  validator,
];
