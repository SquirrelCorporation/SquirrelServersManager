import { SsmAnsible } from 'ssm-shared-lib';
import { setToCache } from '../../../data/cache';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const postMasterNodeUrlValue = async (req, res) => {
  const { value } = req.body;
  await setToCache(SsmAnsible.DefaultSharedExtraVarsList.MASTER_NODE_URL, value);
  new SuccessResponse('Set master node url value', {
    value,
  }).send(res);
};
