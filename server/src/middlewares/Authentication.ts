import UserRepo from '../database/repository/UserRepo';
import logger from '../logger';

const isAuthenticated = async (req, res, next) => {
  if (req.session.user) {
    const user = await UserRepo.findByEmail(req.session.user);
    if (!user) {
      res.status(401).send({
        data: {
          isLogin: false,
        },
        errorCode: '401',
        errorMessage: 'User not found',
        success: true,
      });
      return;
    }
    req.user = user;
    next();
  } else {
    res.status(401).send({
      data: {
        isLogin: false,
      },
      errorCode: '401',
      errorMessage: 'Not logged in！',
      success: true,
    });
    return;
  }
};

export default {
  isAuthenticated,
};
