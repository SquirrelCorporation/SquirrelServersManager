import Playbook, { PlaybookModel } from '../model/Playbook';

async function create(playbook: Playbook): Promise<Playbook> {
  const created = await PlaybookModel.create(playbook);
  return created.toObject();
}

async function updateOrCreate(playbook: Playbook): Promise<Playbook | null> {
  return PlaybookModel.findOneAndUpdate({ name: playbook.name }, playbook, { upsert: true })
    .lean()
    .exec();
}

async function findAll(): Promise<Playbook[] | null> {
  return await PlaybookModel.find().sort({ createdAt: -1 }).lean().exec();
}

async function findOne(name: string): Promise<Playbook | null> {
  return await PlaybookModel.findOne({ name: name }).lean().exec();
}

export default {
  create,
  findAll,
  updateOrCreate,
  findOne,
};
