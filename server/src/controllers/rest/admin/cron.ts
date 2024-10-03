import { API } from 'ssm-shared-lib';
import CronRepo from '../../../data/database/repository/CronRepo';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const getCrons = async (req, res) => {
  const crons = await CronRepo.findAll();
  new SuccessResponse('Get crons', crons as API.Cron[]).send(res);
};
