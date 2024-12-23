import { ObjectId } from 'bson';
import { SsmContainer } from 'ssm-shared-lib';
import ProxmoxContainer, { ProxmoxContainerModel } from '../model/ProxmoxContainer';
import Device from '../model/Device';

async function findAll(): Promise<ProxmoxContainer[] | null> {
  return await ProxmoxContainerModel.aggregate([
    {
      $lookup: {
        from: 'devices',
        localField: 'device',
        foreignField: '_id',
        as: 'device',
      },
    },
    { $unwind: '$device' },
    {
      $addFields: {
        displayType: SsmContainer.ContainerTypes.PROXMOX, // Add the static field `type` with value `'docker'`
      },
    },
  ]).exec();
}

async function updateOrCreate(container: Partial<ProxmoxContainer>) {
  await ProxmoxContainerModel.findOneAndUpdate(
    { name: container.name, watcher: container.watcher },
    container,
    { upsert: true, new: true },
  );
}

async function findContainerByUuid(uuid: string): Promise<ProxmoxContainer | null> {
  return await ProxmoxContainerModel.findOne({ uuid: uuid }).lean().exec();
}

async function findContainersByDevice(device: Device): Promise<ProxmoxContainer[] | null> {
  return await ProxmoxContainerModel.find({ device: device }).lean().exec();
}

async function findContainersByWatcher(watcher: string): Promise<ProxmoxContainer[] | null> {
  return await ProxmoxContainerModel.find({ watcher: watcher }).lean().exec();
}

async function deleteContainerByUuid(uuid: string) {
  await ProxmoxContainerModel.deleteOne({ uuid: uuid }).exec();
}

async function deleteByDevice(device: Device) {
  await ProxmoxContainerModel.deleteMany({ device: device }).exec();
}

async function createContainer(container: ProxmoxContainer, device: Device) {
  container.device = device;
  const createdContainer = await ProxmoxContainerModel.create(container);
  return createdContainer.toObject();
}

async function updateContainer(container: ProxmoxContainer) {
  await ProxmoxContainerModel.updateOne({ uuid: container.uuid }, container);
  return container;
}

async function countByDeviceId(deviceId: string) {
  return await ProxmoxContainerModel.countDocuments({ device: new ObjectId(deviceId) }).exec();
}

async function countByStatus(status: string) {
  return await ProxmoxContainerModel.countDocuments({ status: status }).exec();
}

async function count() {
  return await ProxmoxContainerModel.countDocuments().exec();
}

async function updateStatusByWatcher(watcher: string, status: string) {
  await ProxmoxContainerModel.updateMany({ watcher: watcher }, { status: status }).exec();
}

export default {
  findContainerByUuid,
  findContainersByWatcher,
  deleteContainerByUuid,
  createContainer,
  updateContainer,
  findAll,
  countByDeviceId,
  countByStatus,
  count,
  updateStatusByWatcher,
  deleteByDevice,
  findContainersByDevice,
  updateOrCreate,
};
