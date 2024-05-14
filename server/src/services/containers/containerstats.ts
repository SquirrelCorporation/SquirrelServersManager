import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import ContainerRepo from '../../data/database/repository/ContainerRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import ContainerStatsUseCases from '../../use-cases/ContainerStatsUseCases';

export const getContainerStatByContainerId = asyncHandler(async (req, res) => {
  const { id, type } = req.params;
  logger.info(`[CONTROLLER] - GET - /${id}/stat/${type}/`);

  const container = await ContainerRepo.findContainerById(id);
  if (container == null) {
    throw new NotFoundError(`Container not found ${id}`);
  }
  try {
    const stat = await ContainerStatsUseCases.getStatByDeviceAndType(container, type);
    new SuccessResponse(
      'Get container stat by container id successful',
      stat ? stat[0] : null,
    ).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const getContainerStatsByContainerId = asyncHandler(async (req, res) => {
  const { id, type } = req.params;
  const { from = 24 } = req.query;
  logger.info(`[CONTROLLER] - GET - /${id}/stats/${type}/`);

  const container = await ContainerRepo.findContainerById(id);
  if (container == null) {
    throw new NotFoundError(`Container not found ${id}`);
  }
  try {
    const stats = await ContainerStatsUseCases.getStatsByDeviceAndType(
      container,
      from as number,
      type,
    );
    new SuccessResponse('Get container stats by container id successful', stats).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
