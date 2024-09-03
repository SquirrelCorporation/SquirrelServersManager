import express from 'express';
import passport from 'passport';
import { login, logout } from '../controllers/rest/user/login';
import { loginValidator } from '../controllers/rest/user/login.validator';
import { resetUserApiKey, setUserLoglevel } from '../controllers/rest/user/settings';
import { setUserLoglevelValidator } from '../controllers/rest/user/settings.validator';
import { createFirstUser, getCurrentUser, hasUser } from '../controllers/rest/user/user';
import { createFirstUserValidator } from '../controllers/rest/user/user.validator';

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
