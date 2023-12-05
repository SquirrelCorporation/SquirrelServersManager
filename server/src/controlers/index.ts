import express from 'express';
import ping from './ping';
import devices from "./devices";
import cron from "./admin/cron";
import ansible from "./ansible";

const router = express.Router();

/*---------------------------------------------------------*/
router.use('/devices', devices);
router.use('/ping', ping);
router.use('/admin/crons', cron);
router.use('/ansible/', ansible);

export default router;
