import { UserLogsLevel } from '../../database/model/User';
import UserRepo from '../../database/repository/UserRepo';
import logger from '../../logger';
import Authentication from '../../middlewares/Authentication';
import router from './user';

router.post(
  '/user/settings/resetApiKey',
  Authentication.isAuthenticated,
  async (req, res, next) => {
    logger.info('[CONTROLLER] - POST - /user/settings/resetApiKey');
    const uuid = await UserRepo.resetApiKey(req.user.email);
    res.send({
      success: true,
      data: {
        uuid: uuid,
      },
    });
  },
);

router.post('/user/settings/logs', Authentication.isAuthenticated, async (req, res, next) => {
  logger.info('[CONTROLLER] - POST - /user/settings/logs');
  const userLogsLevel = req.body as UserLogsLevel;
  await UserRepo.updateLogsLevel(req.user.email, userLogsLevel);
  res.send({
    success: true,
  });
});

export default router;
