import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';

export const getPing = asyncHandler(async (req, res) => {
  new SuccessResponse('Get Ping', { message: 'Hello!' }).send(res);
});
