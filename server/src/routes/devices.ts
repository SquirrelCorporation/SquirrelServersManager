import express from 'express';
import passport from 'passport';
import {
  getCheckDeviceAnsibleConnection,
  getCheckDeviceDockerConnection,
  postCheckAnsibleConnection,
  postCheckDockerConnection,
} from '../controllers/rest/devices/check-connection';
import {
  getCheckDeviceAnsibleConnectionValidator,
  getCheckDeviceDockerConnectionValidator,
  postCheckAnsibleConnectionValidator,
  postCheckDockerConnectionValidator,
} from '../controllers/rest/devices/check-connection.validator';
import {
  addDevice,
  addDeviceAuto,
  deleteDevice,
  getAllDevices,
  getDevices,
  updateDockerWatcher,
} from '../controllers/rest/devices/device';
import {
  addDeviceAutoValidator,
  addDeviceValidator,
  deleteDeviceValidator,
} from '../controllers/rest/devices/device.validator';
import {
  addOrUpdateDeviceAuth,
  deleteDockerAuthCerts,
  getDeviceAuth,
  updateDockerAuth,
  uploadDockerAuthCerts,
} from '../controllers/rest/devices/deviceauth';
import {
  addOrUpdateDeviceAuthValidator,
  getDeviceAuthValidator,
  updateDockerAuthValidator,
} from '../controllers/rest/devices/deviceauth.validator';
import {
  getDeviceStatByDeviceUuid,
  getDeviceStatsByDeviceUuid,
  updateDeviceAndAddDeviceStat,
} from '../controllers/rest/devices/devicestats';
import {
  getDeviceStatByDeviceUuidValidator,
  getDeviceStatsByDeviceUuidValidator,
  updateDeviceAndAddDeviceStatValidator,
} from '../controllers/rest/devices/devicestats.validator';
import {
  getDashboardAvailabilityStats,
  getDashboardAveragedStats,
  getDashboardPerformanceStats,
  getDashboardStat,
} from '../controllers/rest/devices/devicestatsdashboard';
import {
  getDashboardAveragedStatsValidator,
  getDashboardStatValidator,
} from '../controllers/rest/devices/devicestatsdashboard.validator';
import upload from '../middlewares/Upload';

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

router
  .route('/:uuid/auth/upload/:type')
  .post(upload.single('uploaded_file'), uploadDockerAuthCerts)
  .delete(deleteDockerAuthCerts);

router.route('/:uuid/docker').post(updateDockerAuthValidator, updateDockerAuth);
router.route('/:uuid/docker-watcher').post(updateDockerWatcher);
router
  .route(`/:uuid/check-connection/ansible`)
  .get(getCheckDeviceAnsibleConnectionValidator, getCheckDeviceAnsibleConnection);
router
  .route(`/:uuid/check-connection/docker`)
  .get(getCheckDeviceDockerConnectionValidator, getCheckDeviceDockerConnection);

router.route('/').put(addDeviceValidator, addDevice).get(getDevices);
router.route('/all').get(getAllDevices);
router.delete(`/:uuid`, deleteDeviceValidator, deleteDevice);
router.get(`/:uuid/stats/:type/`, getDeviceStatsByDeviceUuidValidator, getDeviceStatsByDeviceUuid);
router.get(`/:uuid/stat/:type/`, getDeviceStatByDeviceUuidValidator, getDeviceStatByDeviceUuid);
export default router;
