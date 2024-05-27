import { GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import { InternalError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import { setToCache } from '../../data/cache';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const postDeviceStatsSettings = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  logger.info(`[CONTROLLER] - POST - /settings/device-stats/${key}`);
  try {
    switch (key) {
      case GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS:
        await setToCache(GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS, value);
        return new SuccessResponse(`${key} successfully updated`).send(res);
      default:
        return res.status(404).send({
          success: false,
        });
    }
  } catch (error: any) {
    logger.error(error);
    throw new InternalError(error.message);
  }
});
