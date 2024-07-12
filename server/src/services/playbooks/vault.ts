import { VAULT_PWD } from '../../config';
import { SuccessResponse } from '../../middlewares/api/ApiResponse';
import asyncHandler from '../../middlewares/AsyncHandler';

export const getVaultPwd = asyncHandler(async (req, res) => {
  new SuccessResponse('Successfully got vault pwd', { pwd: VAULT_PWD }).send(res);
});
