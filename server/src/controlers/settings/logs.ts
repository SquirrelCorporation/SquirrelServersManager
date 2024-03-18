import express from 'express';
import { GeneralSettingsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import Authentication from '../../middlewares/Authentication';
import logger from '../../logger';
import { setToCache } from '../../redis';

const router = express.Router();

router.post(`/logs/:key`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /settings/logs/${req.params.key}`);
  if (!req.params.key) {
    res.status(404).send({
      success: false,
      message: 'Key (type) is undefined',
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
      case GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS:
        await setToCache(
          GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
          req.body.value,
        );
        return res.send({ success: true });
      case GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS:
        await setToCache(GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS, req.body.value);
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
