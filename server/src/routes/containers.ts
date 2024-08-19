import express from 'express';
import passport from 'passport';
import {
  getContainers,
  postContainerAction,
  postCustomNameOfContainer,
  refreshAll,
} from '../services/rest/containers/containers';
import {
  postContainerActionValidator,
  postCustomNameOfContainerValidator,
} from '../services/rest/containers/containers.validator';
import {
  getAveragedStats,
  getContainerStatByContainerId,
  getContainerStatsByContainerId,
  getNbContainersByStatus,
} from '../services/rest/containers/containerstats';
import {
  getContainerStatByContainerIdValidator,
  getContainerStatsByContainerIdValidator,
  getNbContainersByStatusValidator,
} from '../services/rest/containers/containerstats.validator';
import {
  createCustomRegistry,
  getRegistries,
  removeRegistry,
  resetRegistry,
  updateRegistry,
} from '../services/rest/containers/registries';
import {
  createCustomRegistryValidator,
  removeRegistryValidator,
  resetRegistryValidator,
  updateRegistryValidator,
} from '../services/rest/containers/registries.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));
router.route('/registries/').get(getRegistries);
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
