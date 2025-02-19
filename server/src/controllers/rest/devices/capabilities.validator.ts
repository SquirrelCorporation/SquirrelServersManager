import { body, param } from 'express-validator';
import validator from '../../../middlewares/Validator';

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
