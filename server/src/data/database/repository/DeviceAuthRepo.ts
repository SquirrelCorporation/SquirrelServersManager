import Device from '../model/Device';
import DeviceAuth, { DeviceAuthModel } from '../model/DeviceAuth';

async function updateOrCreateIfNotExist(deviceAuth: DeviceAuth): Promise<DeviceAuth> {
  const _deviceAuth = await DeviceAuthModel.findOneAndUpdate(
    { device: deviceAuth.device },
    deviceAuth,
    { upsert: true, new: true },
  );
  return _deviceAuth.toObject();
}

async function update(deviceAuth: DeviceAuth): Promise<DeviceAuth | undefined> {
  const _deviceAuth = await DeviceAuthModel.findOneAndUpdate(
    { device: deviceAuth.device },
    deviceAuth,
  );
  return _deviceAuth?.toObject();
}

async function findOneByDevice(device: Device): Promise<DeviceAuth | null> {
  return await DeviceAuthModel.findOne({ device: device }).lean().exec();
}

async function findOneByDeviceUuid(uuid: string): Promise<DeviceAuth[] | null> {
  return await DeviceAuthModel.find()
    .populate({ path: 'device', match: { uuid: { $eq: uuid } } })
    .exec()
    .then((devicesAuth) => {
      return devicesAuth.filter((deviceAuth) => deviceAuth.device != null);
    });
}

async function findManyByDevicesUuid(uuids: string[]): Promise<DeviceAuth[] | null> {
  return await DeviceAuthModel.find()
    .populate({ path: 'device', match: { uuid: { $in: uuids } } })
    .exec()
    .then((devicesAuth) => {
      return devicesAuth.filter((deviceAuth) => deviceAuth.device != null);
    });
}

async function findAllPop(): Promise<DeviceAuth[] | null> {
  return await DeviceAuthModel.find().populate({ path: 'device' }).exec();
}

async function findAllPopWithSshKey(): Promise<DeviceAuth[] | null> {
  return await DeviceAuthModel.find({ sshKey: { $ne: null } })
    .populate({ path: 'device' })
    .exec();
}

async function deleteByDevice(device: Device) {
  await DeviceAuthModel.deleteOne({ device: device }).exec();
}

async function deleteCa(deviceAuth: DeviceAuth) {
  await DeviceAuthModel.updateOne(deviceAuth, { $unset: { dockerCa: 1 } }).exec();
}

async function deleteCert(deviceAuth: DeviceAuth) {
  await DeviceAuthModel.updateOne(deviceAuth, { $unset: { dockerCert: 1 } }).exec();
}

async function deleteKey(deviceAuth: DeviceAuth) {
  await DeviceAuthModel.updateOne(deviceAuth, { $unset: { dockerKey: 1 } }).exec();
}

export default {
  updateOrCreateIfNotExist,
  findOneByDevice,
  findOneByDeviceUuid,
  findAllPop,
  findManyByDevicesUuid,
  deleteByDevice,
  update,
  findAllPopWithSshKey,
  deleteCa,
  deleteCert,
  deleteKey,
};
