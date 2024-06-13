import { API } from 'ssm-shared-lib';
import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../integrations/ansible-vault/vault';
import WatcherEngine from '../../integrations/docker/core/WatcherEngine';
import Shell from '../../integrations/shell';
import logger from '../../logger';

const SENSITIVE_PLACEHOLDER = 'REDACTED';

const redactSensitiveInfos = (key?: string) => {
  return key ? SENSITIVE_PLACEHOLDER : undefined;
};

const preWriteSensitiveInfos = async (newKey: string, originalKey?: string) => {
  if (newKey === 'REDACTED') {
    if (!originalKey) {
      throw new InternalError('Received a redacted key, but original is not set');
    }
    return originalKey;
  } else {
    return await vaultEncrypt(newKey, DEFAULT_VAULT_ID);
  }
};

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
      sshKey: redactSensitiveInfos(deviceAuth.sshKey),
      sshUser: deviceAuth.sshUser,
      sshPwd: redactSensitiveInfos(deviceAuth.sshPwd),
      sshPort: deviceAuth.sshPort,
      becomeMethod: deviceAuth.becomeMethod,
      becomePass: redactSensitiveInfos(deviceAuth.becomePass),
      becomeUser: deviceAuth.becomeUser,
      sshKeyPass: redactSensitiveInfos(deviceAuth.sshKeyPass),
      customDockerSSH: deviceAuth.customDockerSSH,
      dockerCustomAuthType: deviceAuth.dockerCustomAuthType,
      dockerCustomSshUser: deviceAuth.dockerCustomSshUser,
      dockerCustomSshPwd: redactSensitiveInfos(deviceAuth.dockerCustomSshPwd),
      dockerCustomSshKeyPass: redactSensitiveInfos(deviceAuth.dockerCustomSshKeyPass),
      dockerCustomSshKey: redactSensitiveInfos(deviceAuth.dockerCustomSshKey),
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
  const optionalExistingDeviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  const deviceAuth = await DeviceAuthRepo.updateOrCreateIfNotExist({
    device: device,
    authType: authType,
    sshUser: sshUser,
    sshPwd: sshPwd
      ? await preWriteSensitiveInfos(sshPwd, optionalExistingDeviceAuth?.sshPwd)
      : undefined,
    sshPort: sshPort,
    sshKey: sshKey
      ? await preWriteSensitiveInfos(sshKey, optionalExistingDeviceAuth?.sshKey)
      : undefined,
    sshKeyPass: sshKeyPass
      ? await preWriteSensitiveInfos(sshKeyPass, optionalExistingDeviceAuth?.sshKeyPass)
      : undefined,
    becomeMethod: becomeMethod,
    becomePass: becomePass
      ? await preWriteSensitiveInfos(becomePass, optionalExistingDeviceAuth?.becomePass)
      : undefined,
    becomeUser: becomeUser,
  } as DeviceAuth);
  if (sshKey) {
    await Shell.saveSshKey(sshKey, device.uuid);
  }
  logger.info(
    `[CONTROLLER] - POST - Device Auth - Updated or Created device with uuid: ${device.uuid}`,
  );
  void WatcherEngine.deregisterWatchers();
  void WatcherEngine.registerWatchers();
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
  const optionalExistingDeviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  const deviceAuth = await DeviceAuthRepo.update({
    device: device,
    customDockerSSH: customDockerSSH,
    dockerCustomAuthType: dockerCustomAuthType,
    dockerCustomSshUser: dockerCustomSshUser,
    dockerCustomSshPwd: dockerCustomSshPwd
      ? await preWriteSensitiveInfos(
          dockerCustomSshPwd,
          optionalExistingDeviceAuth?.dockerCustomSshPwd,
        )
      : undefined,
    dockerCustomSshKeyPass: dockerCustomSshKeyPass
      ? await preWriteSensitiveInfos(
          dockerCustomSshKeyPass,
          optionalExistingDeviceAuth?.dockerCustomSshKeyPass,
        )
      : undefined,
    dockerCustomSshKey: dockerCustomSshKey
      ? await preWriteSensitiveInfos(
          dockerCustomSshKey,
          optionalExistingDeviceAuth?.dockerCustomSshKey,
        )
      : undefined,
    customDockerForcev6: customDockerForcev6,
    customDockerForcev4: customDockerForcev4,
    customDockerAgentForward: customDockerAgentForward,
    customDockerTryKeyboard: customDockerTryKeyboard,
  } as DeviceAuth);

  logger.info(
    `[CONTROLLER] - POST - Device Docker Auth - Updated device with uuid: ${device.uuid}`,
  );
  void WatcherEngine.deregisterWatchers();
  void WatcherEngine.registerWatchers();
  new SuccessResponse('Update docker auth successful', {
    dockerCustomAuthType: deviceAuth?.dockerCustomAuthType,
  }).send(res);
});
