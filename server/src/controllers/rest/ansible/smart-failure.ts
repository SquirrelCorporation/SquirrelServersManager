import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import SmartFailures from '../../../modules/ansible/SmartFailure';

export const getSmartFailure = async (req, res) => {
  const { execId } = req.query;
  new SuccessResponse(
    'May got Ansible SmartFailure',
    await SmartFailures.parseAnsibleLogsAndMayGetSmartFailure(execId as string),
  ).send(res);
};
