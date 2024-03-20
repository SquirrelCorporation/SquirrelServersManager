import { API } from 'ssm-shared-lib';
import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const getDeviceAuth = asyncHandler(async (req, res) => {
  if (!req.params.uuid) {
    logger.error('[CONTROLLER] - GET - Device Auth - Is called with no id');
    res.status(401).send({
      success: false,
      message: 'Device id is not specified',
    });
    return;
  }

  const device = await DeviceRepo.findOneByUuid(req.params.uuid);
  if (!device) {
    logger.error('[CONTROLLER] - POST - Device Auth - Device not found');
    throw new NotFoundError('Device not found');
  }

  const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  if (!deviceAuth) {
    logger.error('[CONTROLLER] - GET - Device Auth - DeviceAuth not found');
    throw new NotFoundError('Device Auth not found');
  }

  new SuccessResponse('Get device auth', deviceAuth as API.DeviceAuthResponse).send(res);
});

export const addOrUpdateDeviceAuth = asyncHandler(async (req, res) => {
  if (!req.body.type) {
    logger.error('[CONTROLLER] - POST - Device Auth - Is called with no type');
    res.status(401).send({
      success: false,
      message: 'Type is not specified',
    });
    return;
  }
  if (!req.params.uuid) {
    logger.error('[CONTROLLER] - POST - Device Auth - Is called with no id');
    res.status(401).send({
      success: false,
      message: 'Device ID is not specified',
    });
    return;
  }
  const device = await DeviceRepo.findOneByUuid(req.params.uuid);
  if (!device) {
    logger.error('[CONTROLLER] - POST - Device Auth - Device not found');
    throw new NotFoundError('Device ID not found');
  }
  const deviceAuth = await DeviceAuthRepo.updateOrCreateIfNotExist({
    device: device,
    type: req.body.type,
    sshKey: req.body.sshKey,
    sshUser: req.body.sshUser,
    sshPwd: req.body.sshPwd,
    sshPort: req.body.sshPort,
    __enc_sshPwd: true,
    __enc_sshUser: true,
    __enc_sshKey: true,
  } as DeviceAuth);

  logger.info(
    `[CONTROLLER] - POST - Device Auth - Updated or Created device with uuid: ${device.uuid}`,
  );

  new SuccessResponse('Add or update device auth', { type: deviceAuth.type }).send(res);
});
