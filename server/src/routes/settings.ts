import express from 'express';
import passport from 'passport';
import { postDashboardSettings } from '../services/settings/dashboard';
import { postDashboardSettingsValidator } from '../services/settings/dashboard.validator';
import { postDevicesSettings } from '../services/settings/devices';
import { postDevicesSettingsValidator } from '../services/settings/devices.validator';
import { postLogsSettings } from '../services/settings/logs';
import { postLogsSettingsValidator } from '../services/settings/logs.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.post(`/dashboard/:key`, postDashboardSettingsValidator, postDashboardSettings);
router.post(`/devices/:key`, postDevicesSettingsValidator, postDevicesSettings);
router.post(`/logs/:key`, postLogsSettingsValidator, postLogsSettings);

export default router;
