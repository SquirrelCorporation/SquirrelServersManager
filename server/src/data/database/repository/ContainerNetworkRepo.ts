import ContainerNetwork, { ContainerNetworkModel } from '../model/ContainerNetwork';
import Device from '../model/Device';

async function findAll() {
  return await ContainerNetworkModel.find().populate({ path: 'device' }).lean().exec();
}

async function create(network: Partial<ContainerNetwork>) {
  return await ContainerNetworkModel.create(network);
}

async function findNetworksByWatcher(watcher: string): Promise<ContainerNetwork[] | null> {
  return await ContainerNetworkModel.find({ watcher: watcher }).lean().exec();
}

async function deleteNetworkById(id: string) {
  await ContainerNetworkModel.deleteOne({ id: id }).exec();
}

async function deleteByDevice(device: Device) {
  await ContainerNetworkModel.deleteMany({ device: device }).exec();
}

export default {
  findAll,
  create,
  findNetworksByWatcher,
  deleteNetworkById,
  deleteByDevice,
};
