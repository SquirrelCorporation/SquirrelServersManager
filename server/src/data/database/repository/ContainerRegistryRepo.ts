import ContainerRegistry, { ContainerRegistryModel } from '../model/ContainerRegistry';

async function findAll(): Promise<ContainerRegistry[] | null> {
  return await ContainerRegistryModel.find().lean().exec();
}

async function findOneByProvider(provider: string): Promise<ContainerRegistry | null> {
  return await ContainerRegistryModel.findOne({ provider: provider }).lean().exec();
}

async function findOneByName(name: string): Promise<ContainerRegistry | null> {
  return await ContainerRegistryModel.findOne({ name: name }).lean().exec();
}

async function updateOne(registry: ContainerRegistry) {
  return await ContainerRegistryModel.updateOne({ _id: registry._id }, registry).exec();
}

async function create(containerRegistry: ContainerRegistry) {
  const createdObject = await ContainerRegistryModel.create(containerRegistry);
  return createdObject.toObject();
}

export default {
  findOneByProvider,
  create,
  findAll,
  findOneByName,
  updateOne,
};
