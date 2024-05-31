import { VAULT_PWD } from '../../config';
import { SuccessResponse } from '../../core/api/ApiResponse';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const getVaultPwd = asyncHandler(async (req, res) => {
  logger.info('[CONTROLLER] - GET - ansible/vault');

  new SuccessResponse('Successfully got vault pwd', { pwd: VAULT_PWD }).send(res);
});
