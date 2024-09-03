import express from 'express';
import passport from 'passport';
import { deleteConf, getConf, postConf, putConf } from '../controllers/rest/ansible/configuration';
import {
  deleteConfValidator,
  postConfValidator,
} from '../controllers/rest/ansible/configuration.validator';
import { getSmartFailure } from '../controllers/rest/ansible/smart-failure';
import { getSmartFailureValidator } from '../controllers/rest/ansible/smart-failure.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router
  .route('/config')
  .get(getConf)
  .post(postConfValidator, postConf)
  .put(postConfValidator, putConf)
  .delete(deleteConfValidator, deleteConf);

router.route('/smart-failure').get(getSmartFailureValidator, getSmartFailure);
export default router;
