import { GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import { InternalError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import { setToCache } from '../../data/cache';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const postDevicesSettings = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  logger.info(`[CONTROLLER] - POST - /settings/devices/${key}`);
  try {
    switch (key) {
      case GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES:
        await setToCache(GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES, value);
        return new SuccessResponse(`${key} successfully updated`).send(res);
      case GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS:
        await setToCache(GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS, value);
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
