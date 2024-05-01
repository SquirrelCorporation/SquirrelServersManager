import ContainerRegistry from '../data/database/model/ContainerRegistry';
import ContainerRegistryRepo from '../data/database/repository/ContainerRegistryRepo';
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
}

async function createCustomRegistry(name: string, auth: any, authScheme: any) {
  return await ContainerRegistryRepo.create({
    name: name,
    auth: auth,
    authSet: true,
    provider: 'custom',
    canAuth: true,
    authScheme: authScheme,
  });
}

export default {
  addIfNotExists,
  updateRegistryAuth,
  createCustomRegistry,
};
