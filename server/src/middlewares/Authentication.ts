import UserRepo from '../data/database/repository/UserRepo';
import { AuthFailureError } from '../core/api/ApiError';
import asyncHandler from '../helpers/AsyncHandler';

const isAuthenticated = asyncHandler(async (req, res, next) => {
  if (req.session.user) {
    const user = await UserRepo.findByEmail(req.session.user);
    if (!user) {
      throw new AuthFailureError('User not found');
    }
    req.user = user;
    next();
  } else {
    throw new AuthFailureError('Not logged in');
  }
});

export default {
  isAuthenticated,
};
