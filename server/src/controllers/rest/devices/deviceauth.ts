import { API } from 'ssm-shared-lib';
import DeviceAuth from '../../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import {
  preWriteSensitiveInfos,
  redactSensitiveInfos,
} from '../../../helpers/sensitive/handle-sensitive-info';
import logger from '../../../logger';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import WatcherEngine from '../../../modules/containers/core/WatcherEngine';

export const getDeviceAuth = async (req, res) => {
  const { uuid } = req.params;

  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    throw new NotFoundError(`Device not found (${uuid})`);
  }
  const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  if (!deviceAuth) {
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
      sshConnection: deviceAuth.sshConnection,
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
      dockerCa: deviceAuth.dockerCa ? 'MY_CA.pem' : undefined,
      dockerCert: deviceAuth.dockerCert ? 'MY_CERT.cert' : undefined,
      dockerKey: deviceAuth.dockerKey ? 'MY_KEY.key' : undefined,
      proxmoxAuth: {
        remoteConnectionMethod: deviceAuth.proxmoxAuth?.remoteConnectionMethod,
        connectionMethod: deviceAuth.proxmoxAuth?.connectionMethod,
        port: deviceAuth.proxmoxAuth?.port,
        ignoreSslErrors: deviceAuth.proxmoxAuth?.ignoreSslErrors,
        tokens: {
          tokenId: deviceAuth.proxmoxAuth?.tokens?.tokenId,
          tokenSecret: redactSensitiveInfos(deviceAuth.proxmoxAuth?.tokens?.tokenSecret),
        },
        userPwd: {
          username: deviceAuth.proxmoxAuth?.userPwd?.username,
          password: redactSensitiveInfos(deviceAuth.proxmoxAuth?.userPwd?.password),
        },
      },
    } as API.DeviceAuth;
    new SuccessResponse('Get device auth successful', deviceAuthDecrypted as API.DeviceAuth).send(
      res,
    );
  } catch (error: any) {
    logger.error(error);
    throw new InternalError(error.message);
  }
};

export const addOrUpdateDeviceAuth = async (req, res) => {
  const {
    authType,
    sshKey,
    sshUser,
    sshPwd,
    sshPort,
    sshConnection,
    becomeMethod,
    becomePass,
    becomeUser,
    sshKeyPass,
  } = req.body as API.DeviceAuthParams;
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    throw new NotFoundError('Device ID not found');
  }
  const optionalExistingDeviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  const deviceAuth = await DeviceAuthRepo.updateOrCreateIfNotExist({
    device: device,
    authType: authType,
    sshUser: sshUser,
    sshConnection: sshConnection,
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
  void WatcherEngine.deregisterWatchers();
  void WatcherEngine.registerWatchers();
  new SuccessResponse('Add or update device auth successful', { type: deviceAuth.authType }).send(
    res,
  );
};

export const updateDockerAuth = async (req, res) => {
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

  void WatcherEngine.deregisterWatchers();
  void WatcherEngine.registerWatchers();
  new SuccessResponse('Update docker auth successful', {
    dockerCustomAuthType: deviceAuth?.dockerCustomAuthType,
  }).send(res);
};

export const uploadDockerAuthCerts = async (req, res) => {
  const { uuid, type } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);

  if (!device) {
    throw new NotFoundError('Device ID not found');
  }

  const optionalExistingDeviceAuth = await DeviceAuthRepo.findOneByDevice(device);

  if (!optionalExistingDeviceAuth) {
    throw new NotFoundError('Device Auth not found');
  }

  const file = req.file;
  if (!file) {
    throw new Error('File not provided');
  }
  switch (type) {
    case 'ca':
      optionalExistingDeviceAuth.dockerCa = file.buffer; // Assign buffer content
      await DeviceAuthRepo.update(optionalExistingDeviceAuth);
      break;
    case 'key':
      optionalExistingDeviceAuth.dockerKey = file.buffer; // Assign buffer content
      await DeviceAuthRepo.update(optionalExistingDeviceAuth);
      break;
    case 'cert':
      optionalExistingDeviceAuth.dockerCert = file.buffer; // Assign buffer content
      await DeviceAuthRepo.update(optionalExistingDeviceAuth);
      break;
    default:
      throw new Error('Invalid upload type');
  }

  new SuccessResponse('Uploaded file').send(res);
};

export const deleteDockerAuthCerts = async (req, res) => {
  const { uuid, type } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);

  if (!device) {
    throw new NotFoundError('Device ID not found');
  }

  const optionalExistingDeviceAuth = await DeviceAuthRepo.findOneByDevice(device);

  if (!optionalExistingDeviceAuth) {
    throw new NotFoundError('Device Auth not found');
  }

  switch (type) {
    case 'ca':
      await DeviceAuthRepo.deleteCa(optionalExistingDeviceAuth);
      break;
    case 'key':
      await DeviceAuthRepo.deleteKey(optionalExistingDeviceAuth);
      break;
    case 'cert':
      await DeviceAuthRepo.deleteCert(optionalExistingDeviceAuth);
      break;
    default:
      throw new Error('Invalid delete type');
  }

  new SuccessResponse('Deleted file').send(res);
};

export const updateProxmoxAuth = async (req, res) => {
  const { port, tokens, userPwd, remoteConnectionMethod, connectionMethod, ignoreSslErrors } =
    req.body as API.ProxmoxAuth;
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    throw new NotFoundError('Device ID not found');
  }
  const optionalExistingDeviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  await DeviceAuthRepo.update({
    device: device,
    proxmoxAuth: {
      remoteConnectionMethod,
      connectionMethod,
      port,
      ignoreSslErrors,
      tokens: {
        tokenId: tokens?.tokenId,
        tokenSecret: tokens?.tokenSecret
          ? await preWriteSensitiveInfos(
              tokens?.tokenSecret,
              optionalExistingDeviceAuth?.proxmoxAuth?.tokens?.tokenSecret,
            )
          : undefined,
      },
      userPwd: {
        username: userPwd?.username,
        password: userPwd?.password
          ? await preWriteSensitiveInfos(
              userPwd?.password,
              optionalExistingDeviceAuth?.proxmoxAuth?.userPwd?.password,
            )
          : undefined,
      },
    },
  } as DeviceAuth);

  void WatcherEngine.deregisterWatchers();
  void WatcherEngine.registerWatchers();
  new SuccessResponse('Successfully updated proxmox auth').send(res);
};
