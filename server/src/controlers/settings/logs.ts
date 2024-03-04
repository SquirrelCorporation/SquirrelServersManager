import express from 'express';
import Authentication from '../../middlewares/Authentication';
import keys from '../../redis/defaults/keys';
import logger from '../../logger';
import { setToCache } from '../../redis';

const router = express.Router();

router.post(`/logs/:key`, Authentication.isAuthenticated, async (req, res) => {
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
      case keys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS:
        await setToCache(
          keys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
          req.body.value,
        );
        return res.send({ success: true });
      case keys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS:
        await setToCache(keys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS, req.body.value);
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
