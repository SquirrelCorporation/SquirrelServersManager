import express from 'express';
import Authentication from '../middlewares/Authentication';
import { login, logout } from '../services/user/login';
import { resetUserApiKey, setUserLoglevel } from '../services/user/settings';
import { createFirstUser, getCurrentUser, hasUser } from '../services/user/user';

const router = express.Router();

router.use(Authentication.isAuthenticated);

router.post('/user/settings/resetApiKey', resetUserApiKey);
router.post('/user/settings/logs', setUserLoglevel);

router.get(`/hasUsers`, hasUser);
router.post(`/createFirstUser`, createFirstUser);
router.get(`/currentUser`, getCurrentUser);
router.post('/login/account', login);
router.post('/login/outLogin', logout);

export default router;
