import express from 'express';
import passport from 'passport';
import { getCrons } from '../services/rest/admin/cron';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get(`/crons`, getCrons);

export default router;
