import passport from 'passport';
import { getAllNotifications, postAllSeen } from '../services/rest/notifications/notifications';
import router from './logs';

router.use(passport.authenticate('jwt', { session: false }));

router.route(`/`).get(getAllNotifications).post(postAllSeen);

export default router;
