import express from 'express';
import passport from 'passport';
import {
  getContainers,
  postContainerAction,
  postCustomNameOfContainer,
  refreshAll,
} from '../controllers/rest/containers/containers';
import {
  postContainerActionValidator,
  postCustomNameOfContainerValidator,
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
import { getNetworks } from '../controllers/rest/containers/networks';
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
import { deploy, getTemplates } from '../controllers/rest/containers/templates';
import { getVolumes } from '../controllers/rest/containers/volumes';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));
router.route('/registries/').get(getRegistries);
router.post('/deploy', deploy);
router.get(`/templates`, getTemplates);
router.get('/networks', getNetworks);
router.get('/volumes', getVolumes);
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
router.route('/:id/action/:action').post(postContainerActionValidator, postContainerAction);

export default router;
