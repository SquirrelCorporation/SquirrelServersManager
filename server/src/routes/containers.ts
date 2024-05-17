import express from 'express';
import passport from 'passport';
import {
  getContainers,
  postCustomNameOfContainer,
  refreshAll,
} from '../services/containers/containers';
import { postCustomNameOfContainerValidator } from '../services/containers/containers.validator';
import {
  getContainerStatByContainerId,
  getContainerStatsByContainerId,
} from '../services/containers/containerstats';
import {
  getContainerStatByContainerIdValidator,
  getContainerStatsByContainerIdValidator,
} from '../services/containers/containerstats.validator';
import {
  createCustomRegistry,
  getRegistries,
  removeRegistry,
  resetRegistry,
  updateRegistry,
} from '../services/containers/registries';
import {
  createCustomRegistryValidator,
  removeRegistryValidator,
  resetRegistryValidator,
  updateRegistryValidator,
} from '../services/containers/registries.validator';

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

export default router;
