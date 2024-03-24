import { API } from 'ssm-shared-lib';
import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const getDeviceAuth = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  logger.info(`[CONTROLLER] - GET - /devices/auth/${uuid}`);

  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    logger.error('[CONTROLLER] - POST - Device Auth - Device not found');
    throw new NotFoundError('Device not found');
  }
  const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  if (!deviceAuth) {
    logger.error('[CONTROLLER] - GET - Device Auth - DeviceAuth not found');
    throw new NotFoundError('Device Auth not found');
  }
  new SuccessResponse('Get device auth successful', deviceAuth as API.DeviceAuthResponse).send(res);
});

export const addOrUpdateDeviceAuth = asyncHandler(async (req, res) => {
  const { authType, sshKey, sshUser, sshPwd, sshPort } = req.body;
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    logger.error('[CONTROLLER] - POST - Device Auth - Device not found');
    throw new NotFoundError('Device ID not found');
  }
  const deviceAuth = await DeviceAuthRepo.updateOrCreateIfNotExist({
    device: device,
    type: authType,
    sshKey: sshKey,
    sshUser: sshUser,
    sshPwd: sshPwd,
    sshPort: sshPort,
    __enc_sshPwd: true,
    __enc_sshUser: true,
    __enc_sshKey: true,
  } as DeviceAuth);

  logger.info(
    `[CONTROLLER] - POST - Device Auth - Updated or Created device with uuid: ${device.uuid}`,
  );

  new SuccessResponse('Add or update device auth successful', { type: deviceAuth.type }).send(res);
});
