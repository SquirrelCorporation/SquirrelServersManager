import { AuthFailureError } from '../../middlewares/api/ApiError';
import { SuccessResponse } from '../../middlewares/api/ApiResponse';
import { UserLogsLevel } from '../../data/database/model/User';
import UserRepo from '../../data/database/repository/UserRepo';
import asyncHandler from '../../middlewares/AsyncHandler';

export const resetUserApiKey = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AuthFailureError('User is not logged in');
  }
  const uuid = await UserRepo.resetApiKey(req.user.email);
  new SuccessResponse('Reset Api Key', {
    uuid: uuid,
  }).send(res);
});

export const setUserLoglevel = asyncHandler(async (req, res) => {
  const userLogsLevel = req.body as UserLogsLevel;
  if (!req.user) {
    throw new AuthFailureError('User is not logged in');
  }
  await UserRepo.updateLogsLevel(req.user.email, userLogsLevel);
  new SuccessResponse('Set user log level').send(res);
});
