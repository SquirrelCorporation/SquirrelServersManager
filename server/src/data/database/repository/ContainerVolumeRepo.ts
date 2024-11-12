import ContainerVolume, { ContainerVolumeModel } from '../model/ContainerVolume';
import Device from '../model/Device';

async function findAll() {
  return await ContainerVolumeModel.find().populate({ path: 'device' }).lean().exec();
}

async function create(volume: Partial<ContainerVolume>) {
  return await ContainerVolumeModel.create(volume);
}

async function updateOrCreate(volume: Partial<ContainerVolume>) {
  await ContainerVolumeModel.findOneAndUpdate(
    { name: volume.name, watcher: volume.watcher },
    volume,
    { upsert: true, new: true },
  );
}

async function findVolumesByWatcher(watcher: string): Promise<ContainerVolume[] | null> {
  return await ContainerVolumeModel.find({ watcher: watcher }).lean().exec();
}

async function deleteVolumeById(volume: ContainerVolume) {
  await ContainerVolumeModel.deleteOne({ name: volume.name, watcher: volume.watcher }).exec();
}

async function deleteByDevice(device: Device) {
  await ContainerVolumeModel.deleteMany({ device: device }).exec();
}

async function findByUuid(uuid: string) {
  return await ContainerVolumeModel.findOne({ uuid: uuid }).lean().exec();
}

export default {
  findAll,
  create,
  findVolumesByWatcher,
  deleteVolumeById,
  updateOrCreate,
  deleteByDevice,
  findByUuid,
};
