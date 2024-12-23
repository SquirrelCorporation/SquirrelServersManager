import express from 'express';
import passport from 'passport';
import {
  getContainers,
  postCustomNameOfContainer,
  postDockerContainerAction,
  postProxmoxContainerAction,
  refreshAll,
} from '../controllers/rest/containers/containers';
import {
  postCustomNameOfContainerValidator,
  postDockerContainerActionValidator,
  postProxmoxDockerContainerActionValidator,
} from '../controllers/rest/containers/containers.validator';
import {
  getAveragedStats,
  getContainerStatByContainerId,
  getContainerStatsByContainerId,
  getNbContainersByStatus,
} from '../controllers/rest/containers/containerstats';
import {
  getContainerStatByContainerIdValidator,
  getContainerStatsByContainerIdValidator,
  getNbContainersByStatusValidator,
} from '../controllers/rest/containers/containerstats.validator';
import { getImages } from '../controllers/rest/containers/images';
import { getNetworks, postNetwork } from '../controllers/rest/containers/networks';
import {
  createCustomRegistry,
  getRegistries,
  removeRegistry,
  resetRegistry,
  updateRegistry,
} from '../controllers/rest/containers/registries';
import {
  createCustomRegistryValidator,
  removeRegistryValidator,
  resetRegistryValidator,
  updateRegistryValidator,
} from '../controllers/rest/containers/registries.validator';
import {
  deleteCustomStack,
  getCustomStacks,
  patchCustomStack,
  postCustomStack,
  postCustomStackDryRun,
  postDeployCustomStack,
  postTransformCustomStack,
} from '../controllers/rest/containers/stacks';
import {
  deleteCustomStackValidator,
  patchCustomStackValidator,
  postCustomStackValidator,
  postDeployCustomStackValidator,
} from '../controllers/rest/containers/stacks.validator';
import { deploy, getTemplates } from '../controllers/rest/containers/templates';
import {
  getBackupVolume,
  getVolumes,
  postBackupVolume,
  postVolume,
} from '../controllers/rest/containers/volumes';
import {
  getBackupVolumeValidator,
  postBackupVolumeValidator,
} from '../controllers/rest/containers/volumes.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));
router.route('/custom-stacks').get(getCustomStacks);
router.route('/custom-stacks/transform').post(postTransformCustomStack);
router.route('/custom-stacks/dry-run').post(postCustomStackDryRun);
router
  .route('/custom-stacks/deploy/:uuid')
  .post(postDeployCustomStackValidator, postDeployCustomStack);

router.route('/custom-stacks/:name').post(postCustomStackValidator, postCustomStack);
router
  .route('/custom-stacks/:uuid')
  .patch(patchCustomStackValidator, patchCustomStack)
  .delete(deleteCustomStackValidator, deleteCustomStack);
router.route('/registries/').get(getRegistries);
router.post('/deploy', deploy);
router.get(`/templates`, getTemplates);
router.route('/networks').get(getNetworks).post(postNetwork);
router.route('/volumes').get(getVolumes).post(postVolume);
router.route('/volumes/backup').get(getBackupVolumeValidator, getBackupVolume);
router.route('/volumes/backup/:uuid').post(postBackupVolumeValidator, postBackupVolume);
router.get('/images', getImages);
router
  .route('/registries/:name/')
  .post(updateRegistryValidator, updateRegistry)
  .put(createCustomRegistryValidator, createCustomRegistry)
  .delete(removeRegistryValidator, removeRegistry)
  .patch(resetRegistryValidator, resetRegistry);
router.route('/').get(getContainers);
router.route('/refresh-all').post(refreshAll);
router
  .route('/stats/count/:status/')
  .get(getNbContainersByStatusValidator, getNbContainersByStatus);
router.route('/stats/averaged').get(getAveragedStats);
router.route('/:id/name').post(postCustomNameOfContainerValidator, postCustomNameOfContainer);
router.get(
  `/:id/stat/:type/`,
  getContainerStatByContainerIdValidator,
  getContainerStatByContainerId,
);
router.get(
  `/:id/stats/:type/`,
  getContainerStatsByContainerIdValidator,
  getContainerStatsByContainerId,
);
router
  .route('/:id/docker/action/:action')
  .post(postDockerContainerActionValidator, postDockerContainerAction);
router
  .route('/:uuid/proxmox/action/:action')
  .post(postProxmoxDockerContainerActionValidator, postProxmoxContainerAction);

export default router;
