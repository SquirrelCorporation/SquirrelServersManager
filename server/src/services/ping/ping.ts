import { SuccessResponse } from '../../core/api/ApiResponse';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const getPing = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /ping/`);
  new SuccessResponse('Get Ping', { message: 'Hello!' }).send(res);
});
