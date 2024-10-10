import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import SmartFailures from '../../../modules/ansible/SmartFailure';

export const getSmartFailure = async (req, res) => {
  const { execId } = req.query;
  const smartFailure = await SmartFailures.parseAnsibleLogsAndMayGetSmartFailure(execId as string);
  new SuccessResponse('May got Ansible SmartFailure', smartFailure).send(res);
};
