import express from 'express';
import passport from 'passport';
import { getImages } from '../services/containers-services/images';
import { getNetworks } from '../services/containers-services/networks';
import { deploy, getTemplates } from '../services/containers-services/templates';
import { getVolumes } from '../services/containers-services/volumes';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.post('/deploy', deploy);

router.get(`/templates`, getTemplates);
router.get('/networks', getNetworks);
router.get('/volumes', getVolumes);
router.get('/images', getImages);
export default router;
