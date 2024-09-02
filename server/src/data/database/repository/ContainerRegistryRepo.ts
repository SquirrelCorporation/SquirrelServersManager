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

async function findMany(filter: any): Promise<ContainerRegistry[] | null> {
  return await ContainerRegistryModel.find(filter).lean().exec();
}

async function updateOne(registry: ContainerRegistry) {
  return await ContainerRegistryModel.updateOne({ _id: registry._id }, registry).exec();
}

async function create(containerRegistry: Partial<ContainerRegistry>) {
  const createdObject = await ContainerRegistryModel.create(containerRegistry);
  return createdObject.toObject();
}

async function deleteOne(registry: ContainerRegistry) {
  await ContainerRegistryModel.deleteOne({ _id: registry._id });
}

export default {
  findOneByProvider,
  create,
  findAll,
  findOneByName,
  updateOne,
  deleteOne,
  findMany,
};
