import express from 'express';
import Authentication from '../middlewares/Authentication';
import { postDashboardSettings } from '../services/settings/dashboard';
import { postDevicesSettings } from '../services/settings/devices';
import { postLogsSettings } from '../services/settings/logs';

const router = express.Router();

router.use(Authentication.isAuthenticated);

router.post(`/dashboard/:key`, postDashboardSettings);
router.post(`/devices/:key`, postDevicesSettings);
router.post(`/logs/:key`, postLogsSettings);

export default router;
