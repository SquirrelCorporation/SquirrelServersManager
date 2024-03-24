import express from 'express';
import Authentication from '../middlewares/authentication';
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

router.use(Authentication.isAuthenticated);

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
router
  .route('/')
  .put(addDeviceValidator, addDevice)
  .post(addDeviceAutoValidator, addDeviceAuto)
  .get(getDevices);
router.delete(`/:uuid`, deleteDeviceValidator, deleteDevice);
router.post(`/:uuid`, updateDeviceAndAddDeviceStatValidator, updateDeviceAndAddDeviceStat);
router.get(`/:uuid/stats/:type/`, getDeviceStatsByDeviceUuidValidator, getDeviceStatsByDeviceUuid);
router.get(`/:uuid/stat/:type/`, getDeviceStatByDeviceUuidValidator, getDeviceStatByDeviceUuid);

export default router;
