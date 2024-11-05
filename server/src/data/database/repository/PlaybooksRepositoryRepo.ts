import { Repositories } from 'ssm-shared-lib';
import PlaybooksRepository, { PlaybooksRepositoryModel } from '../model/PlaybooksRepository';

async function update(
  playbooksRepository: PlaybooksRepository,
): Promise<PlaybooksRepository | null> {
  playbooksRepository.updatedAt = new Date();
  return PlaybooksRepositoryModel.findOneAndUpdate(
    { uuid: playbooksRepository.uuid },
    playbooksRepository,
  )
    .lean()
    .exec();
}

async function updateOrCreate(
  playbooksRepository: PlaybooksRepository,
): Promise<PlaybooksRepository | null> {
  return PlaybooksRepositoryModel.findOneAndUpdate(
    { uuid: playbooksRepository.uuid },
    playbooksRepository,
    { upsert: true },
  )
    .lean()
    .exec();
}

async function create(playbooksRepository: PlaybooksRepository): Promise<PlaybooksRepository> {
  const created = await PlaybooksRepositoryModel.create(playbooksRepository);
  return created.toObject();
}

async function findAllActiveWithType(
  type: Repositories.RepositoryType,
): Promise<PlaybooksRepository[] | null> {
  return await PlaybooksRepositoryModel.find({ enabled: true, type: type }).lean().exec();
}

async function findAllActive(): Promise<PlaybooksRepository[] | null> {
  return await PlaybooksRepositoryModel.find({ enabled: true }).lean().exec();
}

async function findAllWithType(
  type: Repositories.RepositoryType,
): Promise<PlaybooksRepository[] | null> {
  return await PlaybooksRepositoryModel.find({ type: type }).lean().exec();
}

async function deleteByUuid(uuid: string): Promise<void> {
  await PlaybooksRepositoryModel.deleteOne({ uuid: uuid }).exec();
}

async function findByUuid(uuid: string): Promise<PlaybooksRepository | null> {
  return await PlaybooksRepositoryModel.findOne({ uuid: uuid }).lean().exec();
}

async function saveTree(playbooksRepository: PlaybooksRepository, tree: any): Promise<void> {
  playbooksRepository.tree = tree;
  await PlaybooksRepositoryModel.updateOne({ _id: playbooksRepository._id }, playbooksRepository);
}

export default {
  create,
  findAllActiveWithType,
  findAllActive,
  findAllWithType,
  update,
  deleteByUuid,
  findByUuid,
  saveTree,
  updateOrCreate,
};
