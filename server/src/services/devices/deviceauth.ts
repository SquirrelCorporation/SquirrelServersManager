import { API } from 'ssm-shared-lib';
import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../integrations/ansible-vault/vault';
import logger from '../../logger';

export const getDeviceAuth = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  logger.info(`[CONTROLLER] - GET - /devices/auth/${uuid}`);

  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    logger.error('[CONTROLLER] - POST - Device Auth - Device not found');
    throw new NotFoundError(`Device not found (${uuid})`);
  }
  const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  if (!deviceAuth) {
    logger.error('[CONTROLLER] - GET - Device Auth - DeviceAuth not found');
    throw new NotFoundError(`Device Auth not found (${uuid}`);
  }
  new SuccessResponse('Get device auth successful', deviceAuth as API.DeviceAuth).send(res);
});

export const addOrUpdateDeviceAuth = asyncHandler(async (req, res) => {
  const { authType, sshKey, sshUser, sshPwd, sshPort, becomeMethod, becomePass, becomeUser } =
    req.body as API.DeviceAuthParams;
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    logger.error('[CONTROLLER] - POST - Device Auth - Device not found');
    throw new NotFoundError('Device ID not found');
  }
  const deviceAuth = await DeviceAuthRepo.updateOrCreateIfNotExist({
    device: device,
    authType: authType,
    sshUser: sshUser,
    sshPwd: sshPwd ? await vaultEncrypt(sshPwd, DEFAULT_VAULT_ID) : undefined,
    sshPort: sshPort,
    sshKey: sshKey ? await vaultEncrypt(sshKey, DEFAULT_VAULT_ID) : undefined,
    becomeMethod: becomeMethod,
    becomePass: becomePass ? await vaultEncrypt(becomePass, DEFAULT_VAULT_ID) : undefined,
    becomeUser: becomeUser,
  } as DeviceAuth);

  logger.info(
    `[CONTROLLER] - POST - Device Auth - Updated or Created device with uuid: ${device.uuid}`,
  );

  new SuccessResponse('Add or update device auth successful', { type: deviceAuth.authType }).send(
    res,
  );
});
