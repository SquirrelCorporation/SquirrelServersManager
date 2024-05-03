import {
  addLinkProperty,
  getKindProperty,
  isUpdateAvailable,
} from '../../../integrations/docker/utils/utils';
import Container, { ContainerModel } from '../model/Container';
import Device from '../model/Device';

async function findAll() {
  return await ContainerModel.aggregate([
    {
      $lookup: {
        from: 'devices',
        localField: 'device',
        foreignField: '_id',
        as: 'device',
      },
    },
    { $unwind: '$device' },
  ]).exec();
}

async function findContainerById(id: string) {
  return await ContainerModel.findOne({ id: id }).lean().exec();
}

async function findContainersByWatcher(watcher: string) {
  return await ContainerModel.find({ watcher: watcher }).lean().exec();
}

async function deleteContainerById(id: string) {
  await ContainerModel.deleteOne({ id: id }).exec();
}

async function createContainer(container: Container, device: Device) {
  container.link = addLinkProperty(container);
  container.updateKind = getKindProperty(container);
  container.updateAvailable = isUpdateAvailable(container);
  container.device = device;
  const createdContainer = await ContainerModel.create(container);
  return createdContainer.toObject();
}

async function updateContainer(container: Container) {
  container.link = addLinkProperty(container);
  container.updateKind = getKindProperty(container);
  container.updateAvailable = isUpdateAvailable(container);
  await ContainerModel.updateOne({ id: container.id }, container);
  return container;
}

export default {
  findContainerById,
  findContainersByWatcher,
  deleteContainerById,
  createContainer,
  updateContainer,
  findAll,
};
