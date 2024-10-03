import { API } from 'ssm-shared-lib';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import DeviceStatsUseCases from '../../../services/DeviceStatsUseCases';
import DeviceUseCases from '../../../services/DeviceUseCases';

export const updateDeviceAndAddDeviceStat = async (req, res) => {
  const { uuid } = req.params;
  const deviceInfo: API.DeviceInfo = req.body;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (device == null) {
    throw new NotFoundError(`Device not found (${uuid})`);
  }
  await DeviceUseCases.updateDeviceFromJson(deviceInfo, device);
  await DeviceStatsUseCases.createStatIfMinInterval(deviceInfo, device);
  new SuccessResponse('Update device and add device stat successful').send(res);
};

export const getDeviceStatsByDeviceUuid = async (req, res) => {
  const { uuid, type } = req.params;
  const { from = 24 } = req.query;

  const device = await DeviceRepo.findOneByUuid(uuid);
  if (device == null) {
    throw new NotFoundError(`Device not found ${uuid}`);
  }
  try {
    const stats = await DeviceStatsUseCases.getStatsByDeviceAndType(device, from as number, type);
    new SuccessResponse('Get device stats by device uuid successful', stats).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const getDeviceStatByDeviceUuid = async (req, res) => {
  const { uuid, type } = req.params;

  const device = await DeviceRepo.findOneByUuid(uuid);
  if (device == null) {
    throw new NotFoundError(`Device not found ${uuid}`);
  }
  try {
    const stat = await DeviceStatsUseCases.getStatByDeviceAndType(device, type);
    new SuccessResponse('Get device stats by device uuid successful', stat ? stat[0] : null).send(
      res,
    );
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};
