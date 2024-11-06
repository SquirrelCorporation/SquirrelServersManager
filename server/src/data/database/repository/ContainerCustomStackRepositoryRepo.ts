import ContainerCustomStackRepository, {
  ContainerCustomStacksRepositoryModel,
} from '../model/ContainerCustomStackRepository';

async function create(
  containerCustomStackRepository: ContainerCustomStackRepository,
): Promise<ContainerCustomStackRepository> {
  const created = await ContainerCustomStacksRepositoryModel.create(containerCustomStackRepository);
  return created.toObject();
}

async function findAllActive(): Promise<ContainerCustomStackRepository[] | null> {
  return await ContainerCustomStacksRepositoryModel.find({ enabled: true }).lean().exec();
}

async function findOneByUuid(uuid: string): Promise<ContainerCustomStackRepository | null> {
  return await ContainerCustomStacksRepositoryModel.findOne({ uuid: uuid }).lean().exec();
}

async function update(
  containerCustomStackRepository: ContainerCustomStackRepository,
): Promise<ContainerCustomStackRepository | null> {
  containerCustomStackRepository.updatedAt = new Date();
  return ContainerCustomStacksRepositoryModel.findOneAndUpdate(
    { uuid: containerCustomStackRepository.uuid },
    containerCustomStackRepository,
  )
    .lean()
    .exec();
}

async function deleteByUuid(uuid: string): Promise<void> {
  await ContainerCustomStacksRepositoryModel.deleteOne({ uuid: uuid }).exec();
}
export default {
  create,
  findAllActive,
  findOneByUuid,
  update,
  deleteByUuid,
};
