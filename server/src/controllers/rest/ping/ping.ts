import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const getPing = async (req, res) => {
  new SuccessResponse('Get Ping', { message: 'Hello!' }).send(res);
};
