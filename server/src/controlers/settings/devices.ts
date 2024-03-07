import express from 'express';
import { GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import Authentication from '../../middlewares/Authentication';
import logger from '../../logger';
import { setToCache } from '../../redis';

const router = express.Router();

router.post(`/devices/:key`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /settings/devices/${req.params.key}`);
  if (!req.params.key) {
    res.status(404).send({
      success: false,
    });
    return;
  }
  if (isNaN(req.body.value)) {
    res.status(401).send({
      success: false,
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
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      success: false,
    });
    return;
  }
});

export default router;
