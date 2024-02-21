import UserRepo from '../../database/repository/UserRepo';
import Authentication from '../../middlewares/Authentication';
import router from './user';

router.post(
  '/user/settings/resetApiKey',
  Authentication.isAuthenticated,
  async (req, res, next) => {
    const uuid = await UserRepo.resetApiKey(req.user.email);
    res.send({
      success: true,
      data: {
        uuid: uuid,
      },
    });
  },
);

export default router;
