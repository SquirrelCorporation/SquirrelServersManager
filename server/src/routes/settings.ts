import express from 'express';
import passport from 'passport';
import {
  deleteAnsibleLogs,
  deleteLogs,
  deletePlaybooksModelAndResync,
  postRestartServer,
} from '../controllers/rest/settings/advanced';
import { postDashboardSettings } from '../controllers/rest/settings/dashboard';
import { postDashboardSettingsValidator } from '../controllers/rest/settings/dashboard.validator';
import { postDevicesSettings } from '../controllers/rest/settings/devices';
import { postDevicesSettingsValidator } from '../controllers/rest/settings/devices.validator';
import { postDeviceStatsSettings } from '../controllers/rest/settings/devicestats';
import { postDeviceStatsSettingsValidator } from '../controllers/rest/settings/devicestats.validator';
import {
  getMongoDBServerStats,
  getPrometheusServerStats,
  getRedisServerStats,
} from '../controllers/rest/settings/information';
import { postMasterNodeUrlValue } from '../controllers/rest/settings/keys';
import { postMasterNodeUrlValueValidator } from '../controllers/rest/settings/keys.validator';
import { postLogsSettings } from '../controllers/rest/settings/logs';
import { postLogsSettingsValidator } from '../controllers/rest/settings/logs.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.post(`/dashboard/:key`, postDashboardSettingsValidator, postDashboardSettings);
router.post(`/devices/:key`, postDevicesSettingsValidator, postDevicesSettings);
router.post(`/logs/:key`, postLogsSettingsValidator, postLogsSettings);
router.post(`/device-stats/:key`, postDeviceStatsSettingsValidator, postDeviceStatsSettings);
router.post(`/keys/master-node-url`, postMasterNodeUrlValueValidator, postMasterNodeUrlValue);
router.post('/advanced/restart', postRestartServer);
router.delete('/advanced/logs', deleteLogs);
router.delete('/advanced/ansible-logs', deleteAnsibleLogs);
router.delete('/advanced/playbooks-and-resync', deletePlaybooksModelAndResync);
router.get('/information/mongodb', getMongoDBServerStats);
router.get('/information/redis', getRedisServerStats);
router.get('/information/prometheus', getPrometheusServerStats);
export default router;
