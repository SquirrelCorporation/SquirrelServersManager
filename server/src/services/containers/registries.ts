import { BadRequestError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import ContainerRegistryRepo from '../../data/database/repository/ContainerRegistryRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import ContainerRegistryUseCases from '../../use-cases/ContainerRegistryUseCases';

export const getRegistries = asyncHandler(async (req, res) => {
  const registries = await ContainerRegistryRepo.findAll();
  logger.debug(registries);
  new SuccessResponse('Get registries', {
    registries: registries,
  }).send(res);
});

export const updateRegistry = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const containerRegistry = await ContainerRegistryRepo.findOneByName(name);
  if (!containerRegistry) {
    logger.error('[CONTROLLER] - POST - Container Registry - Registry not found');
    throw new NotFoundError(`Registry not found (${name})`);
  }
  await ContainerRegistryUseCases.updateRegistryAuth(containerRegistry, req.body.auth);
  new SuccessResponse('Get registries', {}).send(res);
});

export const createCustomRegistry = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const containerRegistry = await ContainerRegistryRepo.findOneByName(name);
  if (containerRegistry) {
    logger.error('[CONTROLLER] - PUT - Container Registry - already exist with same name');
    throw new BadRequestError(`Registry already exist with same name: (${name})`);
  }
  await ContainerRegistryUseCases.createCustomRegistry(name, req.body.auth, req.body.authScheme);
  new SuccessResponse('Get registries', {}).send(res);
});
