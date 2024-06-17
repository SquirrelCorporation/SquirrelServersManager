import { SettingsKeys } from 'ssm-shared-lib';
import { InternalError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import { setToCache } from '../../data/cache';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const postLogsSettings = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  logger.info(`[CONTROLLER] - POST - /settings/logs/${key}`);
  try {
    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS:
        await setToCache(
          SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
          value,
        );
        return new SuccessResponse(`${key} successfully updated`).send(res);
      case SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS:
        await setToCache(SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS, value);
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
