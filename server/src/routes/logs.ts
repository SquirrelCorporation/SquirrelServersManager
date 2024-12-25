import express from 'express';
import passport from 'passport';
import { getServerLogs } from '../controllers/rest/logs/server';
import { getTaskEvents, getTaskLogs } from '../controllers/rest/logs/task';
import { getTaskEventsValidator } from '../controllers/rest/logs/task.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get(`/server`, getServerLogs);
router.get(`/tasks`, getTaskLogs);
router.get(`/tasks/:id/events`, getTaskEventsValidator, getTaskEvents);

export default router;
