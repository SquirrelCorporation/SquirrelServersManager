import express from 'express';
import { dependencies, version } from '../../../package.json';
import { CONSIDER_DEVICE_OFFLINE } from '../../config';
import { DeviceStatus } from '../../database/model/Device';
import User, { Role } from '../../database/model/User';
import DeviceRepo from '../../database/repository/DeviceRepo';
import UserRepo from '../../database/repository/UserRepo';
import logger from '../../logger';
import Authentication from '../../middlewares/Authentication';

const router = express.Router();

router.get(`/hasUsers`, async (req, res) => {
  logger.info('[CONTROLLER][USER] - /hasUsers');
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
  logger.info('[CONTROLLER][USER] - /createFirstUser');
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
  logger.info(`[CONTROLLER][USER] - /currentUser ${user?.email}`);
  const devices = await DeviceRepo.findAll();
  const offline = devices?.filter((e) => e.status === DeviceStatus.OFFLINE).length;
  const online = devices?.filter((e) => e.status === DeviceStatus.ONLINE).length;
  const overview = devices?.map((e) => {
    return {
      name: e.fqdn,
      status: e.status === DeviceStatus.ONLINE ? 'online' : 'offline',
      uuid: e.uuid,
      cpu: e.cpuSpeed,
      mem: e.mem,
    };
  });
  const totalCpu = devices?.reduce((accumulator, currentValue) => {
    return accumulator + (currentValue?.cpuSpeed || 0);
  }, 0);
  const totalMem = devices?.reduce((accumulator, currentValue) => {
    return accumulator + (currentValue?.mem || 0);
  }, 0);
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
        totalMem: totalMem ? totalMem / 1024 : NaN,
        overview: overview,
      },
      settings: {
        logsLevel: user.logsLevel,
        apiKey: user?.apiKey,
        device: {
          considerOffLineAfter: CONSIDER_DEVICE_OFFLINE,
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
  logger.info('[CONTROLLER][USER] - /login/account');
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
  logger.info('[CONTROLLER][USER] - /login/outLogin');
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
