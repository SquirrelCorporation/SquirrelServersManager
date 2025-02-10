import express from 'express';
import passport from 'passport';
import { postDeviceCapabilities } from '../controllers/rest/devices/capabilities';
import { postDeviceCapabilitiesValidator } from '../controllers/rest/devices/capabilities.validator';
import {
  getCheckDeviceAnsibleConnection,
  getCheckDeviceDockerConnection,
  getCheckDeviceProxmoxConnection,
  getCheckDeviceRemoteSystemInformationConnection,
  postCheckAnsibleConnection,
  postCheckDockerConnection,
  postCheckRemoteSystemInformationConnection,
  postDiagnostic,
} from '../controllers/rest/devices/check-connection';
import {
  getCheckDeviceAnsibleConnectionValidator,
  getCheckDeviceDockerConnectionValidator,
  getCheckDeviceProxmoxConnectionValidator,
  getCheckDeviceRemoteSystemInformationConnectionValidator,
  postCheckAnsibleConnectionValidator,
  postCheckDockerConnectionValidator,
  postDiagnosticValidator,
} from '../controllers/rest/devices/check-connection.validator';
import {
  postDeviceProxmoxConfiguration,
  postDeviceSystemInformationConfiguration,
  updateDockerWatcher,
} from '../controllers/rest/devices/configuration';
import {
  postDeviceProxmoxConfigurationValidator,
  postDeviceSystemInformationConfigurationValidator,
} from '../controllers/rest/devices/configuration.validator';
import {
  addDevice,
  addDeviceAuto,
  deleteDevice,
  getAllDevices,
  getDevices,
  updateAgentInstallMethod,
} from '../controllers/rest/devices/device';
import {
  addDeviceAutoValidator,
  addDeviceValidator,
  deleteDeviceValidator,
  updateAgentInstallMethodValidator,
} from '../controllers/rest/devices/device.validator';
import {
  addOrUpdateDeviceAuth,
  deleteDockerAuthCerts,
  getDeviceAuth,
  updateDockerAuth,
  updateProxmoxAuth,
  uploadDockerAuthCerts,
} from '../controllers/rest/devices/deviceauth';
import {
  addOrUpdateDeviceAuthValidator,
  getDeviceAuthValidator,
  updateDockerAuthValidator,
  updateProxmoxAuthValidator,
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
router.post(
  '/check-connection/remote-system-information',
  postCheckDockerConnectionValidator,
  postCheckRemoteSystemInformationConnection,
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

router.route('/:uuid/capabilities').post(postDeviceCapabilitiesValidator, postDeviceCapabilities);
router.route('/:uuid/auth/docker').post(updateDockerAuthValidator, updateDockerAuth);
router.route('/:uuid/auth/proxmox').post(updateProxmoxAuthValidator, updateProxmoxAuth);

router
  .route('/:uuid/configuration/containers/proxmox')
  .post(postDeviceProxmoxConfigurationValidator, postDeviceProxmoxConfiguration);
router.route('/:uuid/configuration/containers/docker').post(updateDockerWatcher);
router
  .route('/:uuid/configuration/system-information')
  .post(
    postDeviceSystemInformationConfigurationValidator,
    postDeviceSystemInformationConfiguration,
  );

router
  .route('/:uuid/agent-install-method')
  .post(updateAgentInstallMethodValidator, updateAgentInstallMethod);

// /:uuid/auth/
router
  .route(`/:uuid/auth/ansible/test-connection`)
  .get(getCheckDeviceAnsibleConnectionValidator, getCheckDeviceAnsibleConnection);
router
  .route(`/:uuid/auth/docker/test-connection`)
  .get(getCheckDeviceDockerConnectionValidator, getCheckDeviceDockerConnection);
router
  .route('/:uuid/auth/proxmox/test-connection')
  .post(getCheckDeviceProxmoxConnectionValidator, getCheckDeviceProxmoxConnection);
router
  .route('/:uuid/auth/remote-system-information/test-connection')
  .get(
    getCheckDeviceRemoteSystemInformationConnectionValidator,
    getCheckDeviceRemoteSystemInformationConnection,
  );

router.post('/:uuid/auth/diagnostic', postDiagnosticValidator, postDiagnostic);

router.route('/').put(addDeviceValidator, addDevice).get(getDevices);
router.route('/all').get(getAllDevices);
router.delete(`/:uuid`, deleteDeviceValidator, deleteDevice);
router.get(`/:uuid/stats/:type/`, getDeviceStatsByDeviceUuidValidator, getDeviceStatsByDeviceUuid);
router.get(`/:uuid/stat/:type/`, getDeviceStatByDeviceUuidValidator, getDeviceStatByDeviceUuid);
export default router;
