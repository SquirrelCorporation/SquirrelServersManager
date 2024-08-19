import express from 'express';
import passport from 'passport';
import {
  addDevice,
  addDeviceAuto,
  deleteDevice,
  getDevices,
  updateDockerWatcher,
} from '../services/rest/devices/device';
import {
  addDeviceAutoValidator,
  addDeviceValidator,
  deleteDeviceValidator,
} from '../services/rest/devices/device.validator';
import {
  addOrUpdateDeviceAuth,
  getDeviceAuth,
  updateDockerAuth,
} from '../services/rest/devices/deviceauth';
import {
  addOrUpdateDeviceAuthValidator,
  getDeviceAuthValidator,
  updateDockerAuthValidator,
} from '../services/rest/devices/deviceauth.validator';
import {
  getDeviceStatByDeviceUuid,
  getDeviceStatsByDeviceUuid,
  updateDeviceAndAddDeviceStat,
} from '../services/rest/devices/devicestats';
import {
  getDeviceStatByDeviceUuidValidator,
  getDeviceStatsByDeviceUuidValidator,
  updateDeviceAndAddDeviceStatValidator,
} from '../services/rest/devices/devicestats.validator';
import {
  getDashboardAvailabilityStats,
  getDashboardAveragedStats,
  getDashboardPerformanceStats,
  getDashboardStat,
} from '../services/rest/devices/devicestatsdashboard';
import {
  getDashboardAveragedStatsValidator,
  getDashboardStatValidator,
} from '../services/rest/devices/devicestatsdashboard.validator';
import {
  getCheckDeviceAnsibleConnection,
  getCheckDeviceDockerConnection,
  postCheckAnsibleConnection,
  postCheckDockerConnection,
} from '../services/rest/devices/check-connection';
import {
  getCheckDeviceAnsibleConnectionValidator,
  getCheckDeviceDockerConnectionValidator,
  postCheckAnsibleConnectionValidator,
  postCheckDockerConnectionValidator,
} from '../services/rest/devices/check-connection.validator';

const router = express.Router();

router.post(`/:uuid`, updateDeviceAndAddDeviceStatValidator, updateDeviceAndAddDeviceStat);
router.post('/', addDeviceAutoValidator, addDeviceAuto);

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  '/check-connection/ansible',
  postCheckAnsibleConnectionValidator,
  postCheckAnsibleConnection,
);
router.post(
  '/check-connection/docker',
  postCheckDockerConnectionValidator,
  postCheckDockerConnection,
);

router.get(`/dashboard/stats/performances`, getDashboardPerformanceStats);
router.post(
  `/dashboard/stats/averaged/:type/`,
  getDashboardAveragedStatsValidator,
  getDashboardAveragedStats,
);
router.get(`/dashboard/stats/availability`, getDashboardAvailabilityStats);
router.post(`/dashboard/stats/:type/`, getDashboardStatValidator, getDashboardStat);
router
  .route(`/:uuid/auth`)
  .get(getDeviceAuthValidator, getDeviceAuth)
  .post(addOrUpdateDeviceAuthValidator, addOrUpdateDeviceAuth);
router.route('/:uuid/docker').post(updateDockerAuthValidator, updateDockerAuth);
router.route('/:uuid/docker-watcher').post(updateDockerWatcher);
router
  .route(`/:uuid/check-connection/ansible`)
  .get(getCheckDeviceAnsibleConnectionValidator, getCheckDeviceAnsibleConnection);
router
  .route(`/:uuid/check-connection/docker`)
  .get(getCheckDeviceDockerConnectionValidator, getCheckDeviceDockerConnection);

router.route('/').put(addDeviceValidator, addDevice).get(getDevices);
router.delete(`/:uuid`, deleteDeviceValidator, deleteDevice);
router.get(`/:uuid/stats/:type/`, getDeviceStatsByDeviceUuidValidator, getDeviceStatsByDeviceUuid);
router.get(`/:uuid/stat/:type/`, getDeviceStatByDeviceUuidValidator, getDeviceStatByDeviceUuid);
export default router;
