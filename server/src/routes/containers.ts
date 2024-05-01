import express from 'express';
import passport from 'passport';
import { getContainers } from '../services/containers/containers';
import {
  createCustomRegistry,
  getRegistries,
  updateRegistry,
} from '../services/containers/registries';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));
router.route('/registries/').get(getRegistries);
router.route('/registries/:name/').post(updateRegistry).put(createCustomRegistry);
router.route('/').get(getContainers);

export default router;
