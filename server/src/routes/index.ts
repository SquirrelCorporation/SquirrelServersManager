import express from 'express';
import containers from './containers';
import ping from './ping';
import devices from './devices';
import admin from './admin';
import ansible from './ansible';
import logs from './logs';
import user from './user';
import settings from './settings';

const router = express.Router();

/*---------------------------------------------------------*/
router.use('/devices', devices);
router.use('/ping', ping);
router.use('/admin', admin);
router.use('/ansible', ansible);
router.use('/logs/', logs);
router.use('/settings', settings);
router.use('/', user);
router.use('/containers', containers);

export default router;
