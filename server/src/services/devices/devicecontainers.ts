import { API } from 'ssm-shared-lib';
import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import ContainerUseCases from '../../use-cases/ContainerUseCases';

export const addOrUpdateDeviceContainers = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  logger.info(`[CONTROLLER] - GET - /devices/containers/${uuid}`);

  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    logger.error('[CONTROLLER] - POST - Device Containers - Device not found');
    throw new NotFoundError(`Device not found (${uuid})`);
  }
  logger.debug(JSON.stringify(req.body));
  const { containersResult }: { containersResult: API.ContainerResult[] } = req.body;
  await ContainerUseCases.addOrUpdateContainer(containersResult, device);
  new SuccessResponse('Add or update device containers successful').send(res);
});
