import { parse } from 'url';
import { AnsibleReservedExtraVarsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import { SsmStatus } from 'ssm-shared-lib';
import { API } from 'ssm-shared-lib';
import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import Device from '../../data/database/model/Device';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import { setToCache } from '../../data/redis';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import DeviceUseCases from '../../use-cases/DeviceUseCases';

export const addDevice = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /devices/`);
  if (!req.body.ip) {
    logger.error('[CONTROLLER] - PUT - Device - Is called with no IP is specified');
    res.status(401).send({
      success: false,
      message: 'Ip is not specified',
    });
    return;
  }
  if (req.body.masterNodeUrl) {
    await setToCache(AnsibleReservedExtraVarsKeys.MASTER_NODE_URL, req.body.masterNodeUrl);
  }
  try {
    const isUnManagedDevice = req.body.unManaged === true;
    const createdDevice = await DeviceRepo.create({
      ip: req.body.ip,
      status: isUnManagedDevice
        ? SsmStatus.DeviceStatus.UNMANAGED
        : SsmStatus.DeviceStatus.REGISTERING,
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
    } else {
      logger.error('[CONTROLLER] - PUT - Device - Authentication not specified');
      res.status(401).send({
        success: false,
        message: 'No SSH auth specified',
      });
      return;
    }
    logger.info(`[CONTROLLER] Device - Created device with uuid: ${createdDevice.uuid}`);
    new SuccessResponse('Add device', { device: createdDevice as API.DeviceItem }).send(res);
  } catch (error) {
    res.status(200).send({
      success: false,
      errorMessage: 'The ip already exists',
    });
    return;
  }
});

export const addDeviceAuto = asyncHandler(async (req, res) => {
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
  new SuccessResponse('Add device auto', { id: createdDevice.uuid }).send(res);
});

export const getDevices = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /devices/`);
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.DeviceItem & {
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
      (Object.keys(sorter) as Array<keyof API.DeviceItem>).forEach((uuid) => {
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
        return (Object.keys(filter) as Array<keyof API.DeviceItem>).some((uuid) => {
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

export const deleteDevice = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - DELETE - /devices/${req.params.uuid}`);
  if (!req.params.uuid) {
    logger.error('[CONTROLLER] Device - Is called with no UUID specified');
    res.status(401).send({
      success: false,
      message: 'UUID is not specified',
    });
    return;
  }

  const device = await DeviceRepo.findOneByUuid(req.params.uuid);

  if (!device) {
    logger.error('[CONTROLLER] Device not found');
    throw new NotFoundError('Device not found');
  }
  await DeviceUseCases.deleteDevice(device);
  new SuccessResponse('Delete device', {}).send(res);
});
