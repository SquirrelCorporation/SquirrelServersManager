import express from 'express';
import passport from 'passport';
import { getAllNotifications, postAllSeen } from '../controllers/rest/notifications/notifications';

const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

router.route(`/`).get(getAllNotifications).post(postAllSeen);

export default router;
