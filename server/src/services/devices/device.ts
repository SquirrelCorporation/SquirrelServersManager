import { parse } from 'url';
import { AnsibleReservedExtraVarsKeys } from 'ssm-shared-lib/distribution/enums/settings';
import { SsmStatus } from 'ssm-shared-lib';
import { API } from 'ssm-shared-lib';
import { BadRequestError, NotFoundError } from '../../core/api/ApiError';
import { BadRequestResponse, SuccessResponse } from '../../core/api/ApiResponse';
import Device from '../../data/database/model/Device';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import { setToCache } from '../../data/cache';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import DeviceUseCases from '../../use-cases/DeviceUseCases';

export const addDevice = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /devices/`);
  const { masterNodeUrl, ip, authType, sshKey, sshUser, sshPwd, sshPort, unManaged } = req.body;
  if (masterNodeUrl) {
    await setToCache(AnsibleReservedExtraVarsKeys.MASTER_NODE_URL, req.body.masterNodeUrl);
  }
  try {
    const isUnManagedDevice = unManaged === true;
    const createdDevice = await DeviceRepo.create({
      ip: ip,
      status: isUnManagedDevice
        ? SsmStatus.DeviceStatus.UNMANAGED
        : SsmStatus.DeviceStatus.REGISTERING,
    } as Device);
    await DeviceAuthRepo.updateOrCreateIfNotExist({
      device: createdDevice,
      type: authType,
      sshKey: sshKey,
      sshUser: sshUser,
      sshPwd: sshPwd,
      sshPort: sshPort,
      __enc_sshPwd: true,
      __enc_sshUser: true,
      __enc_sshKey: true,
    } as DeviceAuth);
    logger.info(`[CONTROLLER] Device - Created device with uuid: ${createdDevice.uuid}`);
    new SuccessResponse('Add device successful', { device: createdDevice as API.DeviceItem }).send(
      res,
    );
  } catch (error) {
    throw new BadRequestError('The ip likely already exists');
  }
});

export const addDeviceAuto = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /devices/`);
  const { ip } = req.body;

  const device = await DeviceRepo.findOneByIp(ip);

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
    ip: ip,
  } as Device);
  logger.info(`[CONTROLLER] Device - Created device with uuid: ${createdDevice.uuid}`);
  new SuccessResponse('Add device auto successful', { id: createdDevice.uuid }).send(res);
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

  const device = await DeviceRepo.findOneByUuid(req.params.uuid);

  if (!device) {
    logger.error('[CONTROLLER] Device not found');
    throw new NotFoundError('Device not found');
  }
  await DeviceUseCases.deleteDevice(device);
  new SuccessResponse('Delete device successful').send(res);
});
