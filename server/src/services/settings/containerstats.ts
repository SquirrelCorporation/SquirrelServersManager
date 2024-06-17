import { SettingsKeys } from 'ssm-shared-lib';
import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import { setToCache } from '../../data/cache';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const postContainerStatsSettings = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  logger.info(`[CONTROLLER] - POST - /settings/container-stats/${key}`);
  try {
    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.CONTAINER_STATS_RETENTION_IN_DAYS:
        await setToCache(SettingsKeys.GeneralSettingsKeys.CONTAINER_STATS_RETENTION_IN_DAYS, value);
        return new SuccessResponse(`${key} successfully updated`).send(res);
      default:
        return new NotFoundError();
    }
  } catch (error: any) {
    logger.error(error);
    throw new InternalError(error.message);
  }
});
