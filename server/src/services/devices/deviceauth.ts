import { API } from 'ssm-shared-lib';
import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import {
  DEFAULT_VAULT_ID,
  vaultDecrypt,
  vaultEncrypt,
} from '../../integrations/ansible-vault/vault';
import WatcherEngine from '../../integrations/docker/core/WatcherEngine';
import Shell from '../../integrations/shell';
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
  try {
    const deviceAuthDecrypted = {
      authType: deviceAuth.authType,
      sshKey: deviceAuth.sshKey
        ? await vaultDecrypt(deviceAuth.sshKey, DEFAULT_VAULT_ID)
        : undefined,
      sshUser: deviceAuth.sshUser,
      sshPwd: deviceAuth.sshPwd
        ? await vaultDecrypt(deviceAuth.sshPwd, DEFAULT_VAULT_ID)
        : undefined,
      sshPort: deviceAuth.sshPort,
      becomeMethod: deviceAuth.becomeMethod,
      becomePass: deviceAuth.becomeMethod,
      becomeUser: deviceAuth.becomeUser,
      sshKeyPass: deviceAuth.sshKeyPass
        ? await vaultDecrypt(deviceAuth.sshKeyPass, DEFAULT_VAULT_ID)
        : undefined,
      customDockerSSH: deviceAuth.customDockerSSH,
      dockerCustomAuthType: deviceAuth.dockerCustomAuthType,
      dockerCustomSshUser: deviceAuth.dockerCustomSshUser,
      dockerCustomSshPwd: deviceAuth.dockerCustomSshPwd
        ? await vaultDecrypt(deviceAuth.dockerCustomSshPwd, DEFAULT_VAULT_ID)
        : undefined,
      dockerCustomSshKeyPass: deviceAuth.dockerCustomSshKeyPass
        ? await vaultDecrypt(deviceAuth.dockerCustomSshKeyPass, DEFAULT_VAULT_ID)
        : undefined,
      dockerCustomSshKey: deviceAuth.dockerCustomSshKey
        ? await vaultDecrypt(deviceAuth.dockerCustomSshKey, DEFAULT_VAULT_ID)
        : undefined,
      customDockerForcev6: deviceAuth.customDockerForcev6,
      customDockerForcev4: deviceAuth.customDockerForcev4,
      customDockerAgentForward: deviceAuth.customDockerAgentForward,
      customDockerTryKeyboard: deviceAuth.customDockerTryKeyboard,
      customDockerSocket: deviceAuth.customDockerSocket,
    } as API.DeviceAuth;
    new SuccessResponse('Get device auth successful', deviceAuthDecrypted as API.DeviceAuth).send(
      res,
    );
  } catch (error: any) {
    logger.error(error);
    throw new InternalError(error.message);
  }
});

export const addOrUpdateDeviceAuth = asyncHandler(async (req, res) => {
  const {
    authType,
    sshKey,
    sshUser,
    sshPwd,
    sshPort,
    becomeMethod,
    becomePass,
    becomeUser,
    sshKeyPass,
  } = req.body as API.DeviceAuthParams;
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
    sshKeyPass: sshKeyPass ? await vaultEncrypt(sshKeyPass, DEFAULT_VAULT_ID) : undefined,
    becomeMethod: becomeMethod,
    becomePass: becomePass ? await vaultEncrypt(becomePass, DEFAULT_VAULT_ID) : undefined,
    becomeUser: becomeUser,
  } as DeviceAuth);
  if (sshKey) {
    await Shell.vaultSshKey(sshKey, device.uuid);
  }
  logger.info(
    `[CONTROLLER] - POST - Device Auth - Updated or Created device with uuid: ${device.uuid}`,
  );
  WatcherEngine.deregisterWatchers();
  WatcherEngine.registerWatchers();
  new SuccessResponse('Add or update device auth successful', { type: deviceAuth.authType }).send(
    res,
  );
});

export const updateDockerAuth = asyncHandler(async (req, res) => {
  const {
    customDockerSSH,
    dockerCustomAuthType,
    dockerCustomSshUser,
    dockerCustomSshPwd,
    dockerCustomSshKeyPass,
    dockerCustomSshKey,
    customDockerForcev6,
    customDockerForcev4,
    customDockerAgentForward,
    customDockerTryKeyboard,
  } = req.body as API.DeviceDockerAuthParams;
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    logger.error('[CONTROLLER] - POST - Device Docker Auth - Device not found');
    throw new NotFoundError('Device ID not found');
  }
  const deviceAuth = await DeviceAuthRepo.update({
    device: device,
    customDockerSSH: customDockerSSH,
    dockerCustomAuthType: dockerCustomAuthType,
    dockerCustomSshUser: dockerCustomSshUser,
    dockerCustomSshPwd: dockerCustomSshPwd
      ? await vaultEncrypt(dockerCustomSshPwd, DEFAULT_VAULT_ID)
      : undefined,
    dockerCustomSshKeyPass: dockerCustomSshKeyPass
      ? await vaultEncrypt(dockerCustomSshKeyPass, DEFAULT_VAULT_ID)
      : undefined,
    dockerCustomSshKey: dockerCustomSshKey
      ? await vaultEncrypt(dockerCustomSshKey, DEFAULT_VAULT_ID)
      : undefined,
    customDockerForcev6: customDockerForcev6,
    customDockerForcev4: customDockerForcev4,
    customDockerAgentForward: customDockerAgentForward,
    customDockerTryKeyboard: customDockerTryKeyboard,
  } as DeviceAuth);

  logger.info(
    `[CONTROLLER] - POST - Device Docker Auth - Updated device with uuid: ${device.uuid}`,
  );
  await WatcherEngine.deregisterWatchers();
  await WatcherEngine.registerWatchers();
  new SuccessResponse('Update docker auth successful', {
    dockerCustomAuthType: deviceAuth?.dockerCustomAuthType,
  }).send(res);
});
