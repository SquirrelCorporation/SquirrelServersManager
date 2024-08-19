import express from 'express';
import passport from 'passport';
import { postContainerStatsSettings } from '../services/rest/settings/containerstats';
import { postContainerStatsSettingsValidator } from '../services/rest/settings/containerstats.validator';
import { postDashboardSettings } from '../services/rest/settings/dashboard';
import { postDashboardSettingsValidator } from '../services/rest/settings/dashboard.validator';
import { postDevicesSettings } from '../services/rest/settings/devices';
import { postDevicesSettingsValidator } from '../services/rest/settings/devices.validator';
import { postDeviceStatsSettings } from '../services/rest/settings/devicestats';
import { postDeviceStatsSettingsValidator } from '../services/rest/settings/devicestats.validator';
import { postLogsSettings } from '../services/rest/settings/logs';
import { postLogsSettingsValidator } from '../services/rest/settings/logs.validator';
import {
  deleteAnsibleLogs,
  deleteContainerStats,
  deleteDeviceStats,
  deleteLogs,
  deletePlaybooksModelAndResync,
  postRestartServer,
} from '../services/rest/settings/advanced';

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
