import ContainerRegistry from '../data/database/model/ContainerRegistry';
import ContainerRegistryRepo from '../data/database/repository/ContainerRegistryRepo';
import WatcherEngine from '../integrations/docker/core/WatcherEngine';
import Registry from '../integrations/docker/registries/Registry';

async function addIfNotExists(registry: Registry) {
  const containerRegistry = await ContainerRegistryRepo.findOneByProvider(registry.getId());
  if (!containerRegistry) {
    await ContainerRegistryRepo.create({
      name: registry.name,
      provider: registry.getId(),
      authScheme: registry.getConnectedConfigurationSchema(),
      authSet: false,
      canAuth: registry.getConnectedConfigurationSchema() !== undefined,
    });
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
  const newRegistry = await ContainerRegistryRepo.create({
    name: name,
    auth: auth,
    authSet: true,
    provider: 'custom',
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
