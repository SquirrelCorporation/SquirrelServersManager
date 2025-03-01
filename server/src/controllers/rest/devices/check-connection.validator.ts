import { body, oneOf, param } from 'express-validator';
import { SsmAnsible, SsmProxmox } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

export const postCheckAnsibleConnectionValidator = [
  oneOf([
    body('ip')
      .exists()
      .notEmpty()
      .withMessage('Ip is required in body')
      .isIP()
      .withMessage('IP is invalid'),
    body('ip')
      .isFQDN({
        require_tld: false,
        allow_underscores: true,
        allow_trailing_dot: true,
        allow_numeric_tld: true,
        ignore_max_length: true,
      })
      .withMessage('Value must be a valid IP address or hostname'),
  ]),
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
  oneOf([
    body('ip')
      .exists()
      .notEmpty()
      .withMessage('Ip is required in body')
      .isIP()
      .withMessage('IP is invalid'),
    body('ip')
      .isFQDN({
        require_tld: false,
        allow_underscores: true,
        allow_trailing_dot: true,
        allow_numeric_tld: true,
        ignore_max_length: true,
      })
      .withMessage('Value must be a valid IP address or hostname'),
  ]),
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

export const getCheckDeviceRemoteSystemInformationConnectionValidator = [
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

export const getCheckDeviceProxmoxConnectionValidator = [
  param('uuid')
    .exists()
    .notEmpty()
    .withMessage('Uuid is required')
    .isUUID()
    .withMessage('Uuid is not valid'),
  body('remoteConnectionMethod')
    .exists()
    .isIn(Object.values(SsmProxmox.RemoteConnectionMethod))
    .withMessage('Remote connection method is not supported'),
  body('connectionMethod')
    .exists()
    .isIn(Object.values(SsmProxmox.ConnectionMethod))
    .withMessage('Connection method is not supported'),
  body('port').exists().isNumeric().withMessage('Port is not a number'),
  body('ignoreSslErrors')
    .default(false)
    .isBoolean()
    .withMessage('Ignore SSL errors is not a boolean'),
  validator,
];

// The postDiagnosticValidator has been moved to the DiagnosticController
// in the new NestJS DiagnosticModule
