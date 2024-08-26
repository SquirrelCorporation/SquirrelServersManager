import express from 'express';
import passport from 'passport';
import { deleteConf, getConf, postConf, putConf } from '../services/rest/ansible/configuration';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.route('/config').get(getConf).post(postConf).put(putConf).delete(deleteConf);

export default router;
