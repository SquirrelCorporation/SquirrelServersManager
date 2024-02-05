import DeviceAuth, { DeviceAuthModel } from '../model/DeviceAuth';
import Device from '../model/Device';

async function updateOrCreateIfNotExist(deviceAuth: DeviceAuth): Promise<DeviceAuth> {
  const _deviceAuth = await DeviceAuthModel.findOneAndUpdate(
    { device: deviceAuth.device },
    deviceAuth,
    { upsert: true, new: true },
  );
  return _deviceAuth.toObject();
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

export default {
  updateOrCreateIfNotExist,
  findOneByDevice,
  findOneByDeviceUuid,
  findAllPop,
  findManyByDevicesUuid,
};
