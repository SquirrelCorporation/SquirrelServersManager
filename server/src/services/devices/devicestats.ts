import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import DeviceStatsUseCases from '../../use-cases/DeviceStatsUseCases';
import DeviceUseCases from '../../use-cases/DeviceUseCases';

export const updateDeviceAndAddDeviceStat = asyncHandler(async (req, res) => {
  const device = await DeviceRepo.findOneByUuid(req.params.uuid);
  if (device == null) {
    throw new NotFoundError('Device not found');
  }
  await DeviceUseCases.updateDeviceFromJson(req.body, device);
  await DeviceStatsUseCases.createStatIfMinInterval(req.body, device);
  new SuccessResponse('Update device and add device stat', {}).send(res);
});

export const getDeviceStatsByDeviceUuid = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /${req.params.uuid}/stats/${req.params.type}/`);
  const device = await DeviceRepo.findOneByUuid(req.params.uuid);
  const { from = 24 } = req.query;

  if (device == null) {
    throw new NotFoundError(`Device not found ${req.params.uuid}`);
  }
  try {
    const stats = await DeviceStatsUseCases.getStatsByDeviceAndType(
      device,
      from as number,
      req.params.type,
    );
    new SuccessResponse('Get device stats by device uuid', stats).send(res);
  } catch (error: any) {
    res.status(401).send({
      success: false,
      message: error.message,
    });
  }
});

export const getDeviceStatByDeviceUuid = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /${req.params.uuid}/stat/${req.params.type}/`);

  const device = await DeviceRepo.findOneByUuid(req.params.uuid);

  if (device == null) {
    throw new NotFoundError(`Device not found ${req.params.uuid}`);
  }
  try {
    const stat = await DeviceStatsUseCases.getStatByDeviceAndType(device, req.params.type);
    new SuccessResponse('Get device stats by device uuid', stat ? stat[0] : null).send(res);
  } catch (error: any) {
    res.status(401).send({
      success: false,
      message: error.message,
    });
  }
});
