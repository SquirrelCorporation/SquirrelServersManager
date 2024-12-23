import ContainerCustomStack, { ContainerCustomStackModel } from '../model/ContainerCustomStack';
import ContainerCustomStackRepository from '../model/ContainerCustomStackRepository';

async function findAll() {
  return await ContainerCustomStackModel.find().lean().exec();
}

async function updateOrCreate(stack: Partial<ContainerCustomStack>) {
  return await ContainerCustomStackModel.findOneAndUpdate({ uuid: stack.uuid }, stack, {
    upsert: true,
    new: true,
  })
    .lean()
    .exec();
}

async function findByName(name: string) {
  return await ContainerCustomStackModel.findOne({ name: name }).lean().exec();
}

async function findByUuid(uid: string) {
  return await ContainerCustomStackModel.findOne({ uuid: uid }).lean().exec();
}

async function deleteOne(uuid: string) {
  await ContainerCustomStackModel.deleteOne({ uuid: uuid }).exec();
}

async function listAllByRepository(
  containerCustomStackRepository: ContainerCustomStackRepository,
): Promise<ContainerCustomStack[] | null> {
  return await ContainerCustomStackModel.find({
    containerCustomStackRepository: containerCustomStackRepository,
  })
    .lean()
    .exec();
}

async function deleteAllByRepository(
  containerCustomStackRepository: ContainerCustomStackRepository,
) {
  await ContainerCustomStackModel.deleteMany({
    containerCustomStackRepository: containerCustomStackRepository,
  }).exec();
}

async function findOneByPath(path: string) {
  return await ContainerCustomStackModel.findOne({ path: path }).lean().exec();
}

export default {
  findAll,
  updateOrCreate,
  deleteOne,
  findByName,
  findByUuid,
  listAllByRepository,
  findOneByPath,
  deleteAllByRepository,
};
