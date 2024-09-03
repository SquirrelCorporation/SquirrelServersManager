import { setToCache } from '../../../data/cache';
import { InternalError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';

export const setSharedExtraVarValue = asyncHandler(async (req, res) => {
  try {
    await setToCache(req.params.varname, req.body.value);
    new SuccessResponse('Added or updated extravar').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
