import * as jwt from 'jsonwebtoken';
import { API } from 'ssm-shared-lib';
import { SECRET, SESSION_DURATION } from '../../../config';
import UserRepo from '../../../data/database/repository/UserRepo';
import { AuthFailureError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';

export const login = asyncHandler(async (req, res, next) => {
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
      sameSite: 'none',
    }),
  );
});

export const logout = asyncHandler(async (req, res, next) => {
  if (req.cookies['jwt']) {
    new SuccessResponse('Logout success').send(res.clearCookie('jwt'));
  } else {
    res.status(401).json({
      error: 'Invalid jwt',
    });
  }
});
