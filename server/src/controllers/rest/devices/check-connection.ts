import { API } from 'ssm-shared-lib';
import DeviceAuthRepo from '../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import { preWriteSensitiveInfos } from '../../../helpers/sensitive/handle-sensitive-info';
import { ForbiddenError, InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import Proxmox from '../../../modules/containers/watchers/providers/proxmox/Proxmox';
import Diagnostic from '../../../modules/diagnostic/Diagnostic';
import DeviceUseCases from '../../../services/DeviceUseCases';

export const postCheckAnsibleConnection = async (req, res) => {
  const {
    masterNodeUrl,
    ip,
    authType,
    sshKey,
    sshUser,
    sshPwd,
    sshPort,
    sshConnection,
    becomeMethod,
    becomePass,
    sshKeyPass,
  } = req.body;
  if (!req.user) {
    throw new ForbiddenError();
  }
  try {
    const { taskId } = await DeviceUseCases.checkAnsibleConnection(
      req.user,
      masterNodeUrl,
      ip,
      authType,
      sshConnection,
      sshKey,
      sshUser,
      sshPwd,
      sshPort,
      becomeMethod,
      becomePass,
      sshKeyPass,
    );
    new SuccessResponse('Post CheckAnsibleConnection', {
      taskId: taskId,
    } as API.CheckAnsibleConnection).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const postCheckDockerConnection = async (req, res) => {
  const { ip, authType, sshKey, sshUser, sshPwd, sshPort, becomeMethod, becomePass, sshKeyPass } =
    req.body;
  if (!req.user) {
    throw new ForbiddenError();
  }
  const result = await DeviceUseCases.checkDockerConnection(
    ip,
    authType,
    sshKey,
    sshUser,
    sshPwd,
    sshPort,
    becomeMethod,
    becomePass,
    sshKeyPass,
  );
  try {
    new SuccessResponse('Post CheckDockerConnection', {
      connectionStatus: result.status,
      errorMessage: result.message,
    } as API.CheckDockerConnection).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const getCheckDeviceDockerConnection = async (req, res) => {
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    throw new NotFoundError('Device ID not found');
  }
  const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  if (!deviceAuth) {
    throw new NotFoundError('Device Auth not found');
  }
  try {
    const result = await DeviceUseCases.checkDeviceDockerConnection(device, deviceAuth);
    new SuccessResponse('Post CheckDeviceDockerConnection', {
      connectionStatus: result.status,
      errorMessage: result.message,
    } as API.CheckDockerConnection).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const getCheckDeviceAnsibleConnection = async (req, res) => {
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    throw new NotFoundError('Device ID not found');
  }
  const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  if (!deviceAuth) {
    throw new NotFoundError('Device Auth not found');
  }
  if (!req.user) {
    throw new ForbiddenError();
  }
  try {
    const { taskId } = await DeviceUseCases.checkDeviceAnsibleConnection(req.user, device);
    new SuccessResponse('Post CheckDeviceAnsibleConnection', {
      taskId: taskId,
    } as API.CheckAnsibleConnection).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const postDiagnostic = async (req, res) => {
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    throw new NotFoundError('Device ID not found');
  }
  const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  if (!deviceAuth) {
    throw new NotFoundError('Device Auth not found');
  }
  try {
    void Diagnostic.run(device, deviceAuth);
    new SuccessResponse('Get Device Diagnostic').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const getCheckDeviceProxmoxConnection = async (req, res) => {
  const { port, tokens, userPwd, remoteConnectionMethod, connectionMethod, ignoreSslErrors } =
    req.body as API.ProxmoxAuth;
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    throw new NotFoundError('Device ID not found');
  }
  const optionalExistingDeviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  if (!optionalExistingDeviceAuth) {
    throw new NotFoundError('Device Auth not found');
  }
  const proxmoxAuth = {
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
  } as Partial<API.ProxmoxAuth>;
  try {
    const nodes = await Proxmox.testProxmoxConnection(device, {
      ...optionalExistingDeviceAuth,
      proxmoxAuth,
    });
    new SuccessResponse('Tested proxmox auth', { connectionStatus: 'successful', nodes }).send(res);
  } catch (error: any) {
    new SuccessResponse('Tested proxmox auth', {
      connectionStatus: 'failed',
      errorMessage: error.message,
    }).send(res);
  }
};
