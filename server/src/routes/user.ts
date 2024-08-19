import express from 'express';
import passport from 'passport';
import { login, logout } from '../services/rest/user/login';
import { loginValidator } from '../services/rest/user/login.validator';
import { resetUserApiKey, setUserLoglevel } from '../services/rest/user/settings';
import { setUserLoglevelValidator } from '../services/rest/user/settings.validator';
import { createFirstUser, getCurrentUser, hasUser } from '../services/rest/user/user';
import { createFirstUserValidator } from '../services/rest/user/user.validator';

const router = express.Router();

router.get(`/users`, hasUser);
router.post(`/users`, createFirstUserValidator, createFirstUser);
router.post('/users/login', loginValidator, login);
router.post('/users/logout', logout);

router.use(passport.authenticate('jwt', { session: false }));

router.get(`/users/current`, getCurrentUser);
router.post('/users/settings/resetApiKey', resetUserApiKey);
router.post('/users/settings/logs', setUserLoglevelValidator, setUserLoglevel);

export default router;
