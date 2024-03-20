import { GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { setToCache } from '../../data/redis';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const postDashboardSettings = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /settings/dashboard/${req.params.key}`);
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
      case GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER:
        await setToCache(
          GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
          req.body.value,
        );
        return res.send({ success: true });
      case GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER:
        await setToCache(
          GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
          req.body.value,
        );
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
