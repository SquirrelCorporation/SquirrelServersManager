import express from 'express';
import passport from 'passport';
import { getContainers, postCustomNameOfContainer } from '../services/containers/containers';
import { postCustomNameOfContainerValidator } from '../services/containers/containers.validator';
import {
  getContainerStatByContainerId,
  getContainerStatsByContainerId,
} from '../services/containers/containerstats';
import {
  createCustomRegistry,
  getRegistries,
  removeRegistry,
  resetRegistry,
  updateRegistry,
} from '../services/containers/registries';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));
router.route('/registries/').get(getRegistries);
router
  .route('/registries/:name/')
  .post(updateRegistry)
  .put(createCustomRegistry)
  .delete(removeRegistry)
  .patch(resetRegistry);
router.route('/').get(getContainers);
router.route('/:id/name').post(postCustomNameOfContainerValidator, postCustomNameOfContainer);
router.get(`/:id/stat/:type/`, getContainerStatByContainerId);
router.get(`/:id/stats/:type/`, getContainerStatsByContainerId);

export default router;
