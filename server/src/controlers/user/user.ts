import express from 'express';
import { CONSIDER_DEVICE_OFFLINE } from '../../config';
import { dependencies, version } from '../../../package.json';
import { DeviceStatus } from '../../database/model/Device';
import { Role } from '../../database/model/User';
import DeviceRepo from '../../database/repository/DeviceRepo';
import UserRepo from '../../database/repository/UserRepo';

const router = express.Router();

const getAccess = () => {
  return 'admin';
};

router.get(`/hasUsers`, async (req, res) => {
  const hasUser = (await UserRepo.count()) > 0;
  res.send({
    data: {
      hasUser: hasUser,
    },
    success: true,
  });
  return;
});

router.post(`/createFirstUser`, async (req, res) => {
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
    avatar: avatar,
  });
  res.send({
    success: true,
  });
  return;
});

router.get(`/currentUser`, async (req, res) => {
  if (!getAccess()) {
    res.status(401).send({
      data: {
        isLogin: false,
      },
      errorCode: '401',
      errorMessage: 'Identification is incorrect！',
      success: true,
    });
    return;
  }
  const devices = await DeviceRepo.findAll();
  const offline = devices?.filter((e) => e.status === DeviceStatus.OFFLINE).length;
  const online = devices?.filter((e) => e.status === DeviceStatus.ONLINE).length;
  const simpleStatuses = devices?.map((e) => {
    return {
      name: e.fqdn,
      status: e.status === DeviceStatus.ONLINE ? 'online' : 'offline',
    };
  });
  res.send({
    success: true,
    data: {
      name: 'Serati Ma',
      avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      email: 'antdesign@alipay.com',
      notifyCount: 12,
      unreadCount: 11,
      access: getAccess(),
      devices: {
        online: online,
        offline: offline,
        statuses: simpleStatuses,
      },
      settings: {
        apiKey: 'XXX-XXX-XXX-XXX-XXX-XXX',
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

router.post('/login/account', async (req, res) => {
  const { password, username, type } = req.body;
  if (password === 'admin' && username === 'admin') {
    res.send({
      status: 'ok',
      type,
      currentAuthority: 'admin',
    });
    return;
  }
  if (password === 'ant.design' && username === 'user') {
    res.send({
      status: 'ok',
      type,
      currentAuthority: 'user',
    });
    return;
  }
});

router.post('/api/login/outLogin', (req, res) => {
  res.send({ data: {}, success: true });
});

export default router;
