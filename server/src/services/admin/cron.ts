import { API } from 'ssm-shared-lib';
import { SuccessResponse } from '../../core/api/ApiResponse';
import CronRepo from '../../data/database/repository/CronRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const getCrons = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /crons`);
  const crons = await CronRepo.findAll();
  new SuccessResponse('Get crons', crons as API.Cron[]).send(res);
});
