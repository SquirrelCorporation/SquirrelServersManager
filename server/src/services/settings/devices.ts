import { GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import { InternalError } from '../../core/api/ApiError';
import { setToCache } from '../../data/redis';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const postDevicesSettings = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /settings/devices/${req.params.key}`);
  if (!req.params.key) {
    res.status(404).send({
      success: false,
      message: 'Key (type) not defined',
    });
    return;
  }
  if (isNaN(req.body.value)) {
    res.status(401).send({
      success: false,
      message: 'Value is undefined',
    });
    return;
  }
  try {
    switch (req.params.key) {
      case GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES:
        await setToCache(
          GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
          req.body.value,
        );
        return res.send({ success: true });
      case GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS:
        await setToCache(GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS, req.body.value);
        return res.send({ success: true });
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
