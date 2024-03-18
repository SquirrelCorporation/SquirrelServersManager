import Authentication from '../../middlewares/Authentication';
import logger from '../../logger';
import { setToCache } from '../../redis';
import router from './playbook';

router.post(`/extravars/:varname`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - post - /ansible/extravars/${req.params.varname}`);
  if (!req.params.varname || !req.body.value) {
    res.status(400).send({
      success: false,
      message: 'Playbook or value is undefined',
    });
    return;
  }
  try {
    await setToCache(req.params.varname, req.body.value);
    res.send({
      success: true,
    });
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

export default router;
