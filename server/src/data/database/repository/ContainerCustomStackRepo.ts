import ContainerCustomStack, { ContainerCustomStackModel } from '../model/ContainerCustomStack';

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

export default {
  findAll,
  updateOrCreate,
  deleteOne,
  findByName,
  findByUuid,
};
