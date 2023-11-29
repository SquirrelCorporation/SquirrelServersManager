import express from 'express';
import ping from './ping';
import devices from "./devices";
import cron from "./admin/cron";

const router = express.Router();

/*---------------------------------------------------------*/
router.use('/devices', devices);
router.use('/ping', ping);
router.use('/admin/crons', cron);

export default router;
