import ContainerRegistry from '../data/database/model/ContainerRegistry';
import ContainerRegistryRepo from '../data/database/repository/ContainerRegistryRepo';
import WatcherEngine from '../modules/docker/core/WatcherEngine';
import PinoLogger from '../logger';
import type { SSMServicesTypes } from '../types/typings.d.ts';

const logger = PinoLogger.child(
  { module: 'ContainerRegistryUseCases' },
  { msgPrefix: '[CONTAINER_REGISTRY] - ' },
);

async function addIfNotExists(registry: SSMServicesTypes.RegistryAuthConfig) {
  const containerRegistry = await ContainerRegistryRepo.findOneByProvider(registry.provider);
  if (!containerRegistry) {
    const savedRegistry = await ContainerRegistryRepo.create({
      name: registry.name,
      fullName: registry.fullName,
      provider: registry.provider,
      authScheme: registry.authScheme,
      authSet: false,
      canAnonymous: registry.config.canAnonymous || false,
      canAuth: registry.authScheme !== undefined,
    });
    logger.info(`Saved registry ${savedRegistry.name}`);
  } else {
    logger.info(`Registry ${registry.name} already exists`);
  }
}

async function updateRegistryAuth(registry: ContainerRegistry, auth: any) {
  registry.auth = auth;
  registry.authSet = true;
  await ContainerRegistryRepo.updateOne(registry);
  await WatcherEngine.deregisterRegistries();
  await WatcherEngine.registerRegistries();
}

async function createCustomRegistry(name: string, auth: any, authScheme: any) {
  logger.info(`[CONTAINERREGISTRY][USECASES] - Creating registry : ${name}`);

  const newRegistry = await ContainerRegistryRepo.create({
    name: name,
    auth: auth,
    authSet: true,
    provider: 'custom',
    canAnonymous: false,
    canAuth: true,
    authScheme: authScheme,
  });
  await WatcherEngine.deregisterRegistries();
  await WatcherEngine.registerRegistries();
  return newRegistry;
}

async function removeRegistryAuth(registry: ContainerRegistry) {
  registry.auth = undefined;
  registry.authSet = false;
  await ContainerRegistryRepo.updateOne(registry);
  await WatcherEngine.deregisterRegistries();
  await WatcherEngine.registerRegistries();
}

async function listAllSetupRegistries() {
  return await ContainerRegistryRepo.findMany({ authSet: true });
}

export default {
  addIfNotExists,
  updateRegistryAuth,
  createCustomRegistry,
  removeRegistryAuth,
  listAllSetupRegistries,
};
