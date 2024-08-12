import ContainerImage, { ContainerImageModel } from '../model/ContainerImage';

async function findAll() {
  return await ContainerImageModel.find().populate({ path: 'device' }).lean().exec();
}

async function create(image: Partial<ContainerImage>) {
  return await ContainerImageModel.create(image);
}

async function findImagesByWatcher(watcher: string): Promise<ContainerImage[] | null> {
  return await ContainerImageModel.find({ watcher: watcher }).lean().exec();
}

async function deleteImageById(id: string) {
  await ContainerImageModel.deleteOne({ id: id }).exec();
}

export default {
  findAll,
  create,
  findImagesByWatcher,
  deleteImageById,
};
