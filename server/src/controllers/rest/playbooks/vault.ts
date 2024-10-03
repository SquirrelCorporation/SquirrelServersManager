import { VAULT_PWD } from '../../../config';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const getVaultPwd = async (req, res) => {
  new SuccessResponse('Successfully got vault pwd', { pwd: VAULT_PWD }).send(res);
};
