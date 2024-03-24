import express from 'express';
import Authentication from '../middlewares/authentication';
import { getServerLogs } from '../services/logs/server';
import { getTaskLogs } from '../services/logs/task';

const router = express.Router();

router.use(Authentication.isAuthenticated);

router.get(`/server`, getServerLogs);
router.get(`/tasks`, getTaskLogs);

export default router;
