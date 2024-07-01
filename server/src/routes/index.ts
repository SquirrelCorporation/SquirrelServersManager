import express from 'express';
import containers from './containers';
import ping from './ping';
import devices from './devices';
import admin from './admin';
import playbooks from './playbooks';
import logs from './logs';
import user from './user';
import settings from './settings';
import playbooksRepository from './playbooks-repository';

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

export default router;
