import { v4 as uuidv4 } from 'uuid';
import { SuccessResponse } from '../middlewares/api/ApiResponse';
import asyncHandler from '../middlewares/AsyncHandler';
import router from '../routes/user';
import currentUser from './data/current-user.json';

router.get(
  `/users`,
  asyncHandler(async (req, res) => {
    new SuccessResponse('Has user', { hasUsers: true }).send(res);
  }),
);

router.get(
  '/users/current',
  asyncHandler(async (req, res) => {
    new SuccessResponse('Current user', currentUser).send(res);
  }),
);

router.post(
  '/users/logout',
  asyncHandler(async (req, res) => {
    new SuccessResponse('Logout user').send(res);
  }),
);

router.post(
  '/users/login',
  asyncHandler(async (req, res) => {
    new SuccessResponse('Login success', {
      currentAuthority: 'admin',
    }).send(res);
  }),
);

router.post(
  '/users/settings/resetApiKey',
  asyncHandler(async (req, res) => {
    new SuccessResponse('Reset Api Key', {
      uuid: uuidv4(),
    }).send(res);
  }),
);

router.post(
  '/users/settings/logs',
  asyncHandler(async (req, res) => {
    new SuccessResponse('Set user log level').send(res);
  }),
);
