import express from 'express';
import { dependencies, version } from '../../../package.json';
import User, { Role } from '../../database/model/User';
import UserRepo from '../../database/repository/UserRepo';
import logger from '../../logger';
import Authentication from '../../middlewares/Authentication';
import DeviceUseCases from '../../use-cases/DeviceUseCases';
import { getConfFromCache, getIntConfFromCache } from '../../redis';
import Keys from '../../redis/defaults/keys';
import DashboardUseCase from '../../use-cases/DashboardUseCase';

const router = express.Router();

router.get(`/hasUsers`, async (req, res) => {
  logger.info('[CONTROLLER] - GET - /hasUsers');
  const hasUser = (await UserRepo.count()) > 0;
  res.send({
    data: {
      hasUsers: hasUser,
    },
    success: true,
  });
  return;
});

router.post(`/createFirstUser`, async (req, res) => {
  logger.info('[CONTROLLER] - POST - /createFirstUser');
  const { email, password, name, avatar } = req.body;
  const hasUser = (await UserRepo.count()) > 0;
  if (hasUser) {
    res.status(401).send({
      errorCode: '401',
      errorMessage: 'Your instance already has a user, you must first connect',
      success: true,
    });
    return;
  }

  await UserRepo.create({
    email: email,
    password: password,
    name: name,
    role: Role.ADMIN,
    avatar: avatar || '/avatars/squirrel.png',
  });
  res.send({
    success: true,
  });
  return;
});

router.get(`/currentUser`, Authentication.isAuthenticated, async (req, res) => {
  // @ts-ignore
  const user = req.user as User;
  logger.info(`[CONTROLLER] - GET - /currentUser ${user?.email}`);
  const { online, offline, totalCpu, totalMem, overview } =
    await DeviceUseCases.getDevicesOverview();
  const considerDeviceOffline = await getIntConfFromCache(
    Keys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
  );
  const serverLogRetention = await getIntConfFromCache(
    Keys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
  );
  const ansibleLogRetention = await getIntConfFromCache(
    Keys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
  );
  const performanceMinMem = await getIntConfFromCache(
    Keys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
  );
  const performanceMaxCpu = await getIntConfFromCache(
    Keys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
  );
  const registerDeviceStatEvery = await getIntConfFromCache(
    Keys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS,
  );
  const systemPerformance = await DashboardUseCase.getSystemPerformance();

  res.send({
    success: true,
    data: {
      name: user?.name,
      avatar: user?.avatar,
      email: user?.email,
      notifyCount: 12,
      unreadCount: 11,
      access: user?.role,
      devices: {
        online: online,
        offline: offline,
        totalCpu: totalCpu,
        totalMem: totalMem,
        overview: overview,
      },
      systemPerformance: {
        danger: systemPerformance.danger,
        message: systemPerformance.message,
      },
      settings: {
        userSpecific: {
          userLogsLevel: user.logsLevel,
        },
        logs: {
          serverRetention: serverLogRetention,
          ansibleRetention: ansibleLogRetention,
        },
        dashboard: {
          performance: {
            minMem: performanceMinMem,
            maxCpu: performanceMaxCpu,
          },
        },
        apiKey: user?.apiKey,
        device: {
          registerDeviceStatEvery: registerDeviceStatEvery,
          considerOffLineAfter: considerDeviceOffline,
        },
        server: {
          version: version,
          deps: dependencies,
          processes: process.versions,
        },
      },
    },
  });
});

router.post('/login/account', async (req, res, next) => {
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
  if (user) {
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
        res.send({
          status: 'ok',
          type,
          currentAuthority: user.role,
        });
        return;
      });
    });
  } else {
    res.status(401).send({
      data: {
        isLogin: false,
      },
      errorCode: '401',
      errorMessage: 'Identification is incorrect！',
      success: true,
    });
  }
});

router.post('/login/outLogin', (req, res, next) => {
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
      res.send({ data: {}, success: true });
    });
  });
});

export default router;
