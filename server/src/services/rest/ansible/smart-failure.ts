import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';
import SmartFailures from '../../../modules/ansible/SmartFailure';

export const getSmartFailure = asyncHandler(async (req, res) => {
  const { execId } = req.query;
  new SuccessResponse(
    'May got Ansible SmartFailure',
    await SmartFailures.parseAnsibleLogsAndMayGetSmartFailure(execId as string),
  ).send(res);
});
