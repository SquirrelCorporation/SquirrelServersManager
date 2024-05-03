import express from 'express';
import passport from 'passport';
import { getContainers, postCustomNameOfContainer } from '../services/containers/containers';
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
router.route('/:id/name').post(postCustomNameOfContainer);
export default router;
