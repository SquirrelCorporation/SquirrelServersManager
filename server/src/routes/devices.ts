import express from 'express';
import Authentication from '../middlewares/Authentication';
import { addDevice, addDeviceAuto, deleteDevice, getDevices } from '../services/devices/device';
import { addOrUpdateDeviceAuth, getDeviceAuth } from '../services/devices/deviceauth';
import {
  getDeviceStatByDeviceUuid,
  getDeviceStatsByDeviceUuid,
  updateDeviceAndAddDeviceStat,
} from '../services/devices/devicestats';
import {
  getDashboardAvailabilityStats,
  getDashboardAveragedStats,
  getDashboardPerformanceStats,
  getDashboardStat,
} from '../services/devices/devicestatsdashboard';

const router = express.Router();

router.use(Authentication.isAuthenticated);

router.get(`/dashboard/stats/performances`, getDashboardPerformanceStats);
router.post(`/dashboard/stats/averaged/:type/`, getDashboardAveragedStats);
router.get(`/dashboard/stats/availability`, getDashboardAvailabilityStats);
router.post(`/dashboard/stats/:type/`, getDashboardStat);

router.route(`/:uuid/auth`).get(getDeviceAuth).post(addOrUpdateDeviceAuth);
router.route('/').put(addDevice).post(addDeviceAuto).get(getDevices);
router.delete(`/:uuid`, deleteDevice);
router.post(`/:uuid`, updateDeviceAndAddDeviceStat);
router.get(`/:uuid/stats/:type/`, getDeviceStatsByDeviceUuid);
router.get(`/:uuid/stat/:type/`, getDeviceStatByDeviceUuid);

export default router;
