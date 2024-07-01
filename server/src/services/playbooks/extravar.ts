import { InternalError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import { setToCache } from '../../data/cache';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const addOrUpdateExtraVarValue = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - post - /ansible/extravars/${req.params.varname}`);
  try {
    await setToCache(req.params.varname, req.body.value);
    new SuccessResponse('Added or updated extravar').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
