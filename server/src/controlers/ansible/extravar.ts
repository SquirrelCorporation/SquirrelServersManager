import Authentication from '../../middlewares/Authentication';
import logger from '../../logger';
import { setToCache } from '../../redis';
import router from './playbook';

router.post(`/extravars/:varname`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - post - /ansible/extravars/${req.params.varname}`);
  if (!req.params.varname || !req.body.value) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  try {
    await setToCache(req.params.varname, req.body.value);
    res.send({
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
    });
  }
});

export default router;
