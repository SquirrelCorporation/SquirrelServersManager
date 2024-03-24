import express from 'express';
import Authentication from '../middlewares/authentication';
import { getCrons } from '../services/admin/cron';

const router = express.Router();

router.use(Authentication.isAuthenticated);

router.get(`/crons`, getCrons);

export default router;
