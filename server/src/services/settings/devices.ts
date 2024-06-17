import { SettingsKeys } from 'ssm-shared-lib';
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
      case SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES:
        await setToCache(
          SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
          value,
        );
        return new SuccessResponse(`${key} successfully updated`).send(res);
      case SettingsKeys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS:
        await setToCache(
          SettingsKeys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS,
          value,
        );
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
