import express from 'express';
import Authentication from '../../middlewares/Authentication';
import initRedisValues from '../../redis/defaults';

export { default as logs } from './logs';
export { default as devices } from './devices';
export { default as dashboard } from './dashboard';

const router = express.Router();

router.post(`/reset`, Authentication.isAuthenticated, async (req, res) => {
  await initRedisValues(true);
  return res.send({ success: true });
});

export default router;
