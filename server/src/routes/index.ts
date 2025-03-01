import express from 'express';
import admin from './admin';
import ansible from './ansible';
import containerRepository from './container-stacks-repository';
import containers from './containers';
import devices from './devices';
import logs from './logs';
import notifications from './notifications';
import ping from './ping';
import playbooks from './playbooks';
import playbooksRepository from './playbooks-repository';
import settings from './settings';
import user from './user';

const router = express.Router();

/*---------------------------------------------------------*/
router.use('/devices', devices);
router.use('/ping', ping);
router.use('/admin', admin);
router.use('/playbooks', playbooks);
router.use('/logs/', logs);
router.use('/settings', settings);
router.use('/', user);
router.use('/containers', containers);
router.use('/playbooks-repository', playbooksRepository);
router.use('/notifications', notifications);
router.use('/ansible', ansible);
router.use('/container-repository', containerRepository);

export default router;
