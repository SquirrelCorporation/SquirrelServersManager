import express from 'express';
import passport from 'passport';
import { getServerLogs } from '../services/logs/server';
import { getTaskLogs } from '../services/logs/task';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get(`/server`, getServerLogs);
router.get(`/tasks`, getTaskLogs);

export default router;
