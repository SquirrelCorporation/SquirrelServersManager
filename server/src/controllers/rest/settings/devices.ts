import { SettingsKeys } from 'ssm-shared-lib';
import { setToCache } from '../../../data/cache';
import { InternalError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const postDevicesSettings = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  try {
    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES:
        await setToCache(
          SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
          value,
        );
        new SuccessResponse(`${key} successfully updated`).send(res);
        return;
      case SettingsKeys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS:
        await setToCache(
          SettingsKeys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS,
          value,
        );
        new SuccessResponse(`${key} successfully updated`).send(res);
        return;
      default:
        res.status(404).send({
          success: false,
        });
        return;
    }
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};
