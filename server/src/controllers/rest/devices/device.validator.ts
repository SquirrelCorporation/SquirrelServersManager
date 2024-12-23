import { body, param } from 'express-validator';
import { SsmAgent, SsmAnsible } from 'ssm-shared-lib';
import validator from '../../../middlewares/Validator';

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
  body('ip')
    .exists()
    .notEmpty()
    .withMessage('Ip is required in body')
    .isIP()
    .withMessage('IP is invalid'),
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

export const postDeviceCapabilitiesValidator = [
  param('uuid').exists().notEmpty().isUUID(),
  // Validate structure of 'capabilities.containers'
  body('capabilities.containers')
    .exists()
    .withMessage('Containers field is required inside capabilities.')
    .isObject()
    .withMessage('Containers must be an object.'),
  // Validate 'capabilities.containers.docker.enabled'
  body('capabilities.containers.docker.enabled')
    .exists()
    .withMessage('Docker.enabled is required.')
    .isBoolean()
    .withMessage('Docker.enabled must be a boolean.'),
  // Validate 'capabilities.containers.proxmox.enabled'
  body('capabilities.containers.proxmox.enabled')
    .exists()
    .withMessage('Proxmox.enabled is required.')
    .isBoolean()
    .withMessage('Proxmox.enabled must be a boolean.'),
  // Validate 'capabilities.containers.lxd.enabled'
  body('capabilities.containers.lxd.enabled')
    .exists()
    .withMessage('LXD.enabled is required.')
    .isBoolean()
    .withMessage('LXD.enabled must be a boolean.'),
  validator,
];

export const postDeviceProxmoxConfigurationValidator = [
  param('uuid').exists().notEmpty().isUUID(),
  body('watcherCron')
    .exists()
    .withMessage('watcherCron is required.')
    .isString()
    .withMessage('watcherCron must be a string.'),
  validator,
];
