import { parse } from 'url';
import express from 'express';
import Device, { DeviceStatus } from '../../database/model/Device';
import DeviceRepo from '../../database/repository/DeviceRepo';
import logger from '../../logger';
import Authentication from '../../middlewares/Authentication';
import API from '../../typings';
import DeviceAuthRepo from '../../database/repository/DeviceAuthRepo';
import DeviceAuth from '../../database/model/DeviceAuth';

const router = express.Router();

router.put('/', async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /devices/`);
  if (!req.body.ip) {
    logger.error('[CONTROLLER] Device - Is called with no IP is specified');
    res.status(401).send({
      success: false,
      message: 'Ip is not specified',
    });
    return;
  }
  try {
    const isUnManagedDevice = req.body.unManaged === true;
    const createdDevice = await DeviceRepo.create({
      ip: req.body.ip,
      status: isUnManagedDevice ? DeviceStatus.UNMANAGED : DeviceStatus.REGISTERING,
    } as Device);
    if (req.body.type) {
      await DeviceAuthRepo.updateOrCreateIfNotExist({
        device: createdDevice,
        type: req.body.type,
        sshKey: req.body.sshKey,
        sshUser: req.body.sshUser,
        sshPwd: req.body.sshPwd,
        sshPort: req.body.sshPort,
        __enc_sshPwd: true,
        __enc_sshUser: true,
        __enc_sshKey: true,
      } as DeviceAuth);
    }
    logger.info(`[CONTROLLER] Device - Created device with uuid: ${createdDevice.uuid}`);
    res.send({
      success: true,
      data: {
        id: createdDevice.uuid,
      },
    });
  } catch (error) {
    res.status(200).send({
      success: false,
      errorMessage: 'The ip already exists',
    });
    return;
  }
});

router.post(`/`, async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /devices/`);
  if (!req.body.ip) {
    logger.error('[CONTROLLER] Device - Is called with no IP is specified');
    res.status(401).send({
      success: false,
      message: 'Ip is not specified',
    });
    return;
  }

  const device = await DeviceRepo.findOneByIp(req.body.ip);

  if (device) {
    logger.error('[CONTROLLER] Device - Is called ip already existing');
    res.status(403).send({
      success: false,
      message:
        'The ip already exists, please delete or change your devices before registering this device',
    });
    return;
  }

  const createdDevice = await DeviceRepo.create({
    ip: req.body.ip,
  } as Device);
  logger.info(`[CONTROLLER] Device - Created device with uuid: ${createdDevice.uuid}`);
  res.send({
    success: true,
    data: {
      id: createdDevice.uuid,
    },
  });
});

router.get(`/`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /devices/`);
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.Device & {
      sorter: any;
      filter: any;
    };
  const devices = await DeviceRepo.findAll();
  if (!devices) {
    return res.json([]);
  }
  let dataSource = [...devices].slice(
    ((current as number) - 1) * (pageSize as number),
    (current as number) * (pageSize as number),
  );
  if (params.sorter) {
    const sorter = JSON.parse(params.sorter);
    dataSource = dataSource.sort((prev, next) => {
      let sortNumber = 0;
      (Object.keys(sorter) as Array<keyof API.Device>).forEach((uuid) => {
        const nextSort = next?.uuid as string;
        const preSort = prev?.uuid as string;
        if (sorter[uuid] === 'descend') {
          if (preSort.localeCompare(nextSort) > 0) {
            sortNumber += -1;
          } else {
            sortNumber += 1;
          }
          return;
        }
        if (preSort.localeCompare(nextSort) > 0) {
          sortNumber += 1;
        } else {
          sortNumber += -1;
        }
      });
      return sortNumber;
    });
  }
  if (params.filter) {
    const filter = JSON.parse(params.filter as any) as {
      [key: string]: string[];
    };
    if (Object.keys(filter).length > 0) {
      dataSource = dataSource.filter((item) => {
        return (Object.keys(filter) as Array<keyof API.Device>).some((uuid) => {
          if (!filter[uuid]) {
            return true;
          }
          return filter[uuid].includes(`${item.uuid}`);
        });
      });
    }
  }

  if (params.ip) {
    dataSource = dataSource.filter((data) => data?.ip?.includes(params.ip || ''));
  }
  const result = {
    data: dataSource,
    total: devices.length,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  };

  return res.json(result);
});

export default router;
