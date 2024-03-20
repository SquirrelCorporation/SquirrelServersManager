import { SuccessResponse } from '../../core/api/ApiResponse';
import AnsibleTaskRepo from '../../data/database/repository/AnsibleTaskRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const getTaskLogs = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /logs/tasks`);
  const tasks = await AnsibleTaskRepo.findAll();
  new SuccessResponse('Get task logs', tasks).send(res);
});
