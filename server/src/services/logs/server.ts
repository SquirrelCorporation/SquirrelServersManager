import { SuccessResponse } from '../../core/api/ApiResponse';
import LogsRepo from '../../data/database/repository/LogsRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const getServerLogs = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /logs/server`);
  const logs = await LogsRepo.findAll();
  new SuccessResponse('Get server logs successful', logs).send(res);
});
