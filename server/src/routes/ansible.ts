import express from 'express';
import passport from 'passport';
import { deleteConf, getConf, postConf, putConf } from '../services/rest/ansible/configuration';
import {
  deleteConfValidator,
  postConfValidator,
} from '../services/rest/ansible/configuration.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router
  .route('/config')
  .get(getConf)
  .post(postConfValidator, postConf)
  .put(postConfValidator, putConf)
  .delete(deleteConfValidator, deleteConf);

export default router;
