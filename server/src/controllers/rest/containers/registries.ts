import ContainerRegistryRepo from '../../../data/database/repository/ContainerRegistryRepo';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import ContainerRegistryUseCases from '../../../services/ContainerRegistryUseCases';

export const getRegistries = async (req, res) => {
  const registries = await ContainerRegistryRepo.findAll();
  new SuccessResponse('Get registries', {
    registries: registries,
  }).send(res);
};

export const updateRegistry = async (req, res) => {
  const { name } = req.params;
  const containerRegistry = await ContainerRegistryRepo.findOneByName(name);
  if (!containerRegistry) {
    throw new NotFoundError(`Registry not found (${name})`);
  }
  await ContainerRegistryUseCases.updateRegistryAuth(containerRegistry, req.body.auth);
  new SuccessResponse('Get registries', {}).send(res);
};

export const createCustomRegistry = async (req, res) => {
  const { name } = req.params;
  const containerRegistry = await ContainerRegistryRepo.findOneByName(name);
  if (containerRegistry) {
    throw new BadRequestError(`Registry already exist with same name: (${name})`);
  }
  await ContainerRegistryUseCases.createCustomRegistry(name, req.body.auth, req.body.authScheme);
  new SuccessResponse('Get registries', {}).send(res);
};

export const resetRegistry = async (req, res) => {
  const { name } = req.params;
  const containerRegistry = await ContainerRegistryRepo.findOneByName(name);
  if (!containerRegistry) {
    throw new NotFoundError(`Registry not found (${name})`);
  }
  await ContainerRegistryUseCases.removeRegistryAuth(containerRegistry);
  new SuccessResponse('Reset registry', {}).send(res);
};

export const removeRegistry = async (req, res) => {
  const { name } = req.params;
  const containerRegistry = await ContainerRegistryRepo.findOneByName(name);
  if (!containerRegistry) {
    throw new NotFoundError(`Registry not found (${name})`);
  }
  if (containerRegistry.provider !== 'custom') {
    throw new ForbiddenError('You cannot delete a non custom registry provider');
  }
  await ContainerRegistryRepo.deleteOne(containerRegistry);
  new SuccessResponse('Remove registry', {}).send(res);
};
