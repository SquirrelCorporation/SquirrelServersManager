import express from 'express';
import passport from 'passport';
import { addDevice, addDeviceAuto, deleteDevice, getDevices } from '../services/devices/device';
import {
  addDeviceAutoValidator,
  addDeviceValidator,
  deleteDeviceValidator,
} from '../services/devices/device.validator';
import { addOrUpdateDeviceAuth, getDeviceAuth } from '../services/devices/deviceauth';
import {
  addOrUpdateDeviceAuthValidator,
  getDeviceAuthValidator,
} from '../services/devices/deviceauth.validator';
import { addOrUpdateDeviceContainers } from '../services/devices/devicecontainers';
import {
  getDeviceStatByDeviceUuid,
  getDeviceStatsByDeviceUuid,
  updateDeviceAndAddDeviceStat,
} from '../services/devices/devicestats';
import {
  getDeviceStatByDeviceUuidValidator,
  getDeviceStatsByDeviceUuidValidator,
  updateDeviceAndAddDeviceStatValidator,
} from '../services/devices/devicestats.validator';
import {
  getDashboardAvailabilityStats,
  getDashboardAveragedStats,
  getDashboardPerformanceStats,
  getDashboardStat,
} from '../services/devices/devicestatsdashboard';
import {
  getDashboardAveragedStatsValidator,
  getDashboardStatValidator,
} from '../services/devices/devicestatsdashboard.validator';

const router = express.Router();

router.post(`/:uuid`, updateDeviceAndAddDeviceStatValidator, updateDeviceAndAddDeviceStat);
router.post('/', addDeviceAutoValidator, addDeviceAuto);
router.post('/containers/:uuid', addOrUpdateDeviceContainers);

router.use(passport.authenticate('jwt', { session: false }));

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
router.route('/').put(addDeviceValidator, addDevice).get(getDevices);
router.delete(`/:uuid`, deleteDeviceValidator, deleteDevice);
router.get(`/:uuid/stats/:type/`, getDeviceStatsByDeviceUuidValidator, getDeviceStatsByDeviceUuid);
router.get(`/:uuid/stat/:type/`, getDeviceStatByDeviceUuidValidator, getDeviceStatByDeviceUuid);
export default router;
