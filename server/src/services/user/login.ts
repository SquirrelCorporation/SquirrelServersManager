import { API } from 'ssm-shared-lib';
import * as jwt from 'jsonwebtoken';
import { SECRET, SESSION_DURATION } from '../../config';
import { AuthFailureError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import UserRepo from '../../data/database/repository/UserRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const login = asyncHandler(async (req, res, next) => {
  logger.info('[CONTROLLER] - POST - /login/account');
  const { password, username } = req.body;
  if (!password || !username) {
    res.status(401).send({
      data: {
        isLogin: false,
      },
      errorCode: '401',
      errorMessage: 'Identification is incorrect！',
      success: true,
    });
  }
  const user = await UserRepo.findByEmailAndPassword(username, password);
  if (!user) {
    throw new AuthFailureError('Identification is incorrect！');
  }

  const payload = {
    email: user.email,
    expiration: Date.now() + SESSION_DURATION,
  };

  const token = jwt.sign(JSON.stringify(payload), SECRET);
  new SuccessResponse('Login success', {
    currentAuthority: user.role,
  } as API.LoginInfo).send(
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, //--> SET TO TRUE ON PRODUCTION
    }),
  );
});

export const logout = asyncHandler(async (req, res, next) => {
  logger.info('[CONTROLLER] - POST - /login/outLogin');

  if (req.cookies['jwt']) {
    new SuccessResponse('Logout success').send(res.clearCookie('jwt'));
  } else {
    res.status(401).json({
      error: 'Invalid jwt',
    });
  }
});
