import express from 'express';
import ping from './ping';
import * as devices from './devices';
import cron from './admin/cron';
import * as ansible from './ansible';
import * as logs from './logs';
import * as user from './user';
import * as settings from './settings';

const router = express.Router();

/*---------------------------------------------------------*/
router.use('/devices', devices.devicestatsdashboard);
router.use('/devices', devices.devices);
router.use('/devices', devices.devicestats);
router.use('/devices', devices.deviceauth);
router.use('/ping', ping);
router.use('/admin/crons', cron);
router.use('/ansible/', ansible.hook);
router.use('/ansible/', ansible.inventory);
router.use('/ansible/', ansible.execution);
router.use('/logs/', logs.task);
router.use('/logs/', logs.server);
router.use('/ansible/', ansible.playbook);
router.use('/settings', settings.default);
router.use('/settings', settings.logs);
router.use('/settings', settings.dashboard);
router.use('/settings', settings.devices);
router.use('/', user.user);
router.use('/', user.settings);

export default router;
