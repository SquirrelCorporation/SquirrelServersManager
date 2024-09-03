import express from 'express';
import passport from 'passport';
import {
  deleteAnsibleLogs,
  deleteContainerStats,
  deleteDeviceStats,
  deleteLogs,
  deletePlaybooksModelAndResync,
  postRestartServer,
} from '../controllers/rest/settings/advanced';
import { postContainerStatsSettings } from '../controllers/rest/settings/containerstats';
import { postContainerStatsSettingsValidator } from '../controllers/rest/settings/containerstats.validator';
import { postDashboardSettings } from '../controllers/rest/settings/dashboard';
import { postDashboardSettingsValidator } from '../controllers/rest/settings/dashboard.validator';
import { postDevicesSettings } from '../controllers/rest/settings/devices';
import { postDevicesSettingsValidator } from '../controllers/rest/settings/devices.validator';
import { postDeviceStatsSettings } from '../controllers/rest/settings/devicestats';
import { postDeviceStatsSettingsValidator } from '../controllers/rest/settings/devicestats.validator';
import { postLogsSettings } from '../controllers/rest/settings/logs';
import { postLogsSettingsValidator } from '../controllers/rest/settings/logs.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.post(`/dashboard/:key`, postDashboardSettingsValidator, postDashboardSettings);
router.post(`/devices/:key`, postDevicesSettingsValidator, postDevicesSettings);
router.post(`/logs/:key`, postLogsSettingsValidator, postLogsSettings);
router.post(`/device-stats/:key`, postDeviceStatsSettingsValidator, postDeviceStatsSettings);
router.post(
  `/container-stats/:key`,
  postContainerStatsSettingsValidator,
  postContainerStatsSettings,
);
router.post('/advanced/restart', postRestartServer);
router.delete('/advanced/logs', deleteLogs);
router.delete('/advanced/ansible-logs', deleteAnsibleLogs);
router.delete('/advanced/device-stats', deleteDeviceStats);
router.delete('/advanced/container-stats', deleteContainerStats);
router.delete('/advanced/playbooks-and-resync', deletePlaybooksModelAndResync);
export default router;
