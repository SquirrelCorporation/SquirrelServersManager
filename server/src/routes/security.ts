import express from 'express';
import passport from 'passport';
import { getAllTestResults } from '../controllers/rest/security/security';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get(`/`, getAllTestResults);

export default router;
