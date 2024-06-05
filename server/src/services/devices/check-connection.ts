import { ForbiddenError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import DeviceUseCases from '../../use-cases/DeviceUseCases';

export const postCheckAnsibleConnection = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /devices/check/before-add`);
  const {
    masterNodeUrl,
    ip,
    authType,
    sshKey,
    sshUser,
    sshPwd,
    sshPort,
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
      sshKey,
      sshUser,
      sshPwd,
      sshPort,
      becomeMethod,
      becomePass,
      sshKeyPass,
    );
    new SuccessResponse('Post CheckAnsibleConnection', { taskId: taskId }).send(res);
  } catch (error) {
    logger.error(error);
  }
});

export const postCheckDockerConnection = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /devices/check/before-add`);
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
    }).send(res);
  } catch (error) {
    logger.error(error);
  }
});
