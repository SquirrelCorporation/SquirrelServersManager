import { API } from 'ssm-shared-lib';
import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import ContainerRepo from '../../data/database/repository/ContainerRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import WatcherEngine from '../../integrations/docker/core/WatcherEngine';
import logger from '../../logger';
import ContainerUseCases from '../../use-cases/ContainerUseCases';

export const getContainers = asyncHandler(async (req, res) => {
  const containers = (await ContainerRepo.findAll()) as API.Container[];
  logger.debug(containers);
  new SuccessResponse('Get containers', {
    containers: containers,
  }).send(res);
});

export const postCustomNameOfContainer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { customName } = req.body;
  const container = await ContainerRepo.findContainerById(id);
  if (!container) {
    throw new NotFoundError(`Container with id ${id} not found`);
  }
  await ContainerUseCases.updateCustomName(customName, container);
  new SuccessResponse('Updated container', {}).send(res);
});

export const refreshAll = asyncHandler(async (req, res) => {
  try {
    await Promise.all(
      Object.values(WatcherEngine.getStates().watcher).map((watcher) => watcher.watch()),
    );
    new SuccessResponse('refreshed all containers', {}).send(res);
  } catch (e: any) {
    throw new InternalError(`Error when watching images (${e.message})`);
  }
});
