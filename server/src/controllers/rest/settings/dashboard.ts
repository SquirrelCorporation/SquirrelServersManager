import { SettingsKeys } from 'ssm-shared-lib';
import { setToCache } from '../../../data/cache';
import { InternalError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const postDashboardSettings = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  try {
    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER:
        await setToCache(
          SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
          value,
        );
        new SuccessResponse(`${key} successfully updated`).send(res);
        return;
      case SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER:
        await setToCache(
          SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
          value,
        );
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
