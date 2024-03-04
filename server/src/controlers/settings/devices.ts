import express from 'express';
import Authentication from '../../middlewares/Authentication';
import keys from '../../redis/defaults/keys';
import logger from '../../logger';
import { setToCache } from '../../redis';

const router = express.Router();

router.post(`/devices/:key`, Authentication.isAuthenticated, async (req, res) => {
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
      case keys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES:
        await setToCache(
          keys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
          req.body.value,
        );
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
