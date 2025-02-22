import Playbook, { PlaybookModel } from '../model/Playbook';
import PlaybooksRepository from '../model/PlaybooksRepository';

async function create(playbook: Playbook): Promise<Playbook> {
  const created = await PlaybookModel.create(playbook);
  return created.toObject();
}

async function updateOrCreate(playbook: Playbook): Promise<Playbook | null> {
  return PlaybookModel.findOneAndUpdate({ path: playbook.path }, playbook, { upsert: true })
    .lean()
    .exec();
}

async function findAll(): Promise<Playbook[] | null> {
  return await PlaybookModel.find().sort({ createdAt: -1 }).lean().exec();
}

async function findAllWithActiveRepositories(): Promise<Playbook[] | null> {
  return await PlaybookModel.find()
    .populate({ path: 'playbooksRepository', match: { enabled: { $eq: true } } })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}

async function findOneByName(name: string): Promise<Playbook | null> {
  return await PlaybookModel.findOne({ name: name })
    .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
    .lean()
    .exec();
}

async function findOneByUuid(uuid: string): Promise<Playbook | null> {
  return await PlaybookModel.findOne({ uuid: uuid })
    .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
    .lean()
    .exec();
}

async function listAllByRepository(
  playbooksRepository: PlaybooksRepository,
): Promise<Playbook[] | null> {
  return await PlaybookModel.find({ playbooksRepository: playbooksRepository }).lean().exec();
}

async function deleteByUuid(uuid: string): Promise<void> {
  await PlaybookModel.deleteOne({ uuid: uuid }).lean().exec();
}

async function findOneByPath(path: string): Promise<Playbook | null> {
  return await PlaybookModel.findOne({ path: path })
    .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
    .lean()
    .exec();
}

async function findOneByUniqueQuickReference(quickRef: string): Promise<Playbook | null> {
  return await PlaybookModel.findOne({ uniqueQuickRef: quickRef })
    .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
    .lean()
    .exec();
}

async function deleteAllByRepository(playbooksRepository: PlaybooksRepository): Promise<void> {
  await PlaybookModel.deleteMany({ playbooksRepository: playbooksRepository }).exec();
}

export default {
  create,
  findAll,
  updateOrCreate,
  findOneByName,
  findOneByUuid,
  listAllByRepository,
  deleteByUuid,
  findOneByPath,
  findAllWithActiveRepositories,
  findOneByUniqueQuickReference,
  deleteAllByRepository,
};
