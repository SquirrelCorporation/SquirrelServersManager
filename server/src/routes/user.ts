import express from 'express';
import passport from 'passport';
import { login, logout } from '../services/user/login';
import { loginValidator } from '../services/user/login.validator';
import { resetUserApiKey, setUserLoglevel } from '../services/user/settings';
import { setUserLoglevelValidator } from '../services/user/settings.validator';
import { createFirstUser, getCurrentUser, hasUser } from '../services/user/user';
import { createFirstUserValidator } from '../services/user/user.validator';

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
