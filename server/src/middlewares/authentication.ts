import { NextFunction, Request, Response } from 'express';
import UserRepo from '../data/database/repository/UserRepo';
import { AuthFailureError } from '../core/api/ApiError';

const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    const user = await UserRepo.findByEmail(req.session.user);
    if (!user) {
      return next(new AuthFailureError('User not found'));
    }
    req.user = user;
    next();
  } else {
    next(new AuthFailureError('Not logged in'));
  }
};

export default {
  isAuthenticated,
};
