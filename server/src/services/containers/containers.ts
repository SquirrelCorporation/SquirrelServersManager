import { req } from 'pino-std-serializers';
import { API } from 'ssm-shared-lib';
import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import ContainerRepo from '../../data/database/repository/ContainerRepo';
import asyncHandler from '../../helpers/AsyncHandler';
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
