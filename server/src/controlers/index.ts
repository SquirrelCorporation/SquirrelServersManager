import express from 'express';
import ping from './ping';
import devices from "./devices";
import cron from "./admin/cron";
import * as ansible from "./ansible";

const router = express.Router();

/*---------------------------------------------------------*/
router.use('/devices', devices);
router.use('/ping', ping);
router.use('/admin/crons', cron);
router.use('/ansible/', ansible.hook);
router.use('/ansible/', ansible.inventory);
router.use('/ansible/', ansible.execution);
router.use('/ansible/', ansible.task);
router.use('/ansible/', ansible.playbook);


export default router;
