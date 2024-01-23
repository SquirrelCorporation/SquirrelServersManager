import DeviceAuth, { DeviceAuthModel } from '../model/DeviceAuth';
import Device, { DeviceModel } from '../model/Device';

async function updateOrCreateIfNotExist(deviceAuth: DeviceAuth): Promise<DeviceAuth> {
  const _deviceAuth = await DeviceAuthModel.findOneAndUpdate(
    { device: deviceAuth.device },
    deviceAuth,
    { upsert: true, new: true },
  );
  return _deviceAuth.toObject();
}

async function findOneByDeviceId(device: Device): Promise<DeviceAuth | null> {
  return await DeviceAuthModel.findOne({ device: device }).lean().exec();
}

export default {
  updateOrCreateIfNotExist,
  findOneByDeviceId,
};
