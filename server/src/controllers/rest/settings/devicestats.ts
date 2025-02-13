import { SettingsKeys } from 'ssm-shared-lib';
import { setToCache } from '../../../data/cache';
import { InternalError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import { PrometheusService } from '../../../services/prometheus/PrometheusService';

export const postDeviceStatsSettings = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  try {
    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS:
        await PrometheusService.getInstance().updatePrometheusRetention(`${value}d`);
        await setToCache(SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS, value);
        new SuccessResponse(`${key} successfully updated`).send(res);
        return;
      default:
        return res.status(404).send({
          success: false,
        });
    }
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};
