import { body, oneOf, param } from 'express-validator';
import { SsmAgent, SsmAnsible } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

export const addDeviceValidator = [
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
    .isIn(Object.values(SsmAnsible.SSHType))
    .withMessage('authType is not in enum value SSHType'),
  body('sshConnection')
    .if(body('authType').equals(SsmAnsible.SSHType.PasswordLess))
    .isIn([SsmAnsible.SSHConnection.BUILTIN, undefined])
    .withMessage('sshConnection must be "ssh" for passwordless authentication'),
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
  body('installMethod')
    .if(
      (value, { req }) =>
        !req.body.unManaged || req.body.unManaged.toString().toLowerCase() === 'false',
    )
    .isIn(Object.values(SsmAgent.InstallMethods))
    .withMessage('installMethod is not in enum value InstallMethods'),
  validator,
];

export const addDeviceAutoValidator = [
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
  validator,
];

export const updateAgentInstallMethodValidator = [
  param('uuid').exists().notEmpty().isUUID(),
  body('installMethod')
    .isIn(Object.values(SsmAgent.InstallMethods))
    .withMessage('installMethod is not in enum value InstallMethods'),
  validator,
];

export const deleteDeviceValidator = [param('uuid').exists().notEmpty().isUUID(), validator];
