import { API } from 'ssm-shared-lib';
import CronRepo from '../../../data/database/repository/CronRepo';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';

export const getCrons = asyncHandler(async (req, res) => {
  const crons = await CronRepo.findAll();
  new SuccessResponse('Get crons', crons as API.Cron[]).send(res);
});
