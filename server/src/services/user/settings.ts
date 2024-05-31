import { SuccessResponse } from '../../core/api/ApiResponse';
import { UserLogsLevel } from '../../data/database/model/User';
import UserRepo from '../../data/database/repository/UserRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const resetUserApiKey = asyncHandler(async (req, res) => {
  logger.info('[CONTROLLER] - POST - /user/settings/resetApiKey');
  const uuid = await UserRepo.resetApiKey(req.user.email);
  new SuccessResponse('Reset Api Key', {
    uuid: uuid,
  }).send(res);
});

export const setUserLoglevel = asyncHandler(async (req, res) => {
  logger.info('[CONTROLLER] - POST - /user/settings/logs');
  const userLogsLevel = req.body as UserLogsLevel;
  await UserRepo.updateLogsLevel(req.user.email, userLogsLevel);
  new SuccessResponse('Set user log level').send(res);
});
