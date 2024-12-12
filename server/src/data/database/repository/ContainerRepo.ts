import { ObjectId } from 'bson';
import {
  addLinkProperty,
  getKindProperty,
  isUpdateAvailable,
} from '../../../modules/containers/utils/utils';
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

async function findContainerById(id: string): Promise<Container | null> {
  return await ContainerModel.findOne({ id: id }).lean().exec();
}

async function findContainersByDevice(device: Device): Promise<Container[] | null> {
  return await ContainerModel.find({ device: device }).lean().exec();
}

async function findContainersByWatcher(watcher: string): Promise<Container[] | null> {
  return await ContainerModel.find({ watcher: watcher }).lean().exec();
}

async function deleteContainerById(id: string) {
  await ContainerModel.deleteOne({ id: id }).exec();
}

async function deleteByDevice(device: Device) {
  await ContainerModel.deleteMany({ device: device }).exec();
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

async function countByDeviceId(deviceId: string) {
  return await ContainerModel.countDocuments({ device: new ObjectId(deviceId) }).exec();
}

async function countByStatus(status: string) {
  return await ContainerModel.countDocuments({ status: status }).exec();
}

async function count() {
  return await ContainerModel.countDocuments().exec();
}

async function updateStatusByWatcher(watcher: string, status: string) {
  await ContainerModel.updateMany({ watcher: watcher }, { status: status }).exec();
}

export default {
  findContainerById,
  findContainersByWatcher,
  deleteContainerById,
  createContainer,
  updateContainer,
  findAll,
  countByDeviceId,
  countByStatus,
  count,
  updateStatusByWatcher,
  deleteByDevice,
  findContainersByDevice,
};
