import SecurityTestResultRepo from '../../../data/database/repository/SecurityTestResultRepo';
import { InternalError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const getAllTestResults = async (req, res) => {
  try {
    const testResults = await SecurityTestResultRepo.findAll();

    new SuccessResponse('Got Security Test Results successfully', testResults).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};
