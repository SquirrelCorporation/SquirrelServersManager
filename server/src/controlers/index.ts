import express from 'express';
import ping from './ping';
import devices from "./devices";

const router = express.Router();

/*---------------------------------------------------------*/
router.use('/devices', devices);
router.use('/ping', ping);

export default router;
