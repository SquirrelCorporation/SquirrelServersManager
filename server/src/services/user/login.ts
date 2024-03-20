import { API } from 'ssm-shared-lib';
import { AuthFailureError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import UserRepo from '../../data/database/repository/UserRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const login = asyncHandler(async (req, res, next) => {
  logger.info('[CONTROLLER] - POST - /login/account');
  const { password, username, type } = req.body;
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
  req.session.regenerate(function (err) {
    if (err) {
      next(err);
    }
    req.session.user = user.email;

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) {
        return next(err);
      }
      logger.info('[CONTROLLER][USER] - /login/account - Logged in successfull');
      new SuccessResponse('Login success', {
        type,
        currentAuthority: user.role,
      } as API.LoginInfo).send(res);
    });
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  logger.info('[CONTROLLER] - POST - /login/outLogin');
  req.session.user = null;
  req.session.save(function (err) {
    if (err) {
      next(err);
    }
    req.session.regenerate(function (err) {
      if (err) {
        next(err);
      }
      new SuccessResponse('Logout', {}).send(res);
    });
  });
});
