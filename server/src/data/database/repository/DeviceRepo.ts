import { DateTime } from 'luxon';
import { DeviceStatus } from 'ssm-shared-lib/distribution/enums/status';
import logger from '../../../logger';
import Device, { DeviceModel } from '../model/Device';
import DeviceDownTimeEventRepo from './DeviceDownTimeEventRepo';

async function create(device: Device): Promise<Device> {
  const createdDevice = await DeviceModel.create(device);
  return createdDevice.toObject();
}

async function update(device: Device): Promise<Device | null> {
  device.updatedAt = new Date();
  return DeviceModel.findOneAndUpdate({ uuid: device.uuid }, device, { new: true }).lean().exec();
}

async function findOneByUuid(uuid: string): Promise<Device | null> {
  return await DeviceModel.findOne({ uuid: uuid }).lean().exec();
}

async function findByUuids(uuids: string[]): Promise<Device[] | null> {
  return await DeviceModel.find({ uuid: { $in: uuids } })
    .lean()
    .exec();
}

async function findOneByIp(ip: string): Promise<Device | null> {
  return await DeviceModel.findOne({ ip: ip }).lean().exec();
}

async function findAll(): Promise<Device[] | null> {
  return await DeviceModel.find().sort({ createdAt: -1 }).lean().exec();
}

async function setDeviceOfflineAfter(inactivityInMinutes: number) {
  const devices = await DeviceModel.find({
    updatedAt: { $lt: DateTime.now().minus({ minute: inactivityInMinutes }).toJSDate() },
    $and: [
      { status: { $ne: DeviceStatus.OFFLINE } },
      { status: { $ne: DeviceStatus.UNMANAGED } },
      { status: { $ne: DeviceStatus.REGISTERING } },
    ],
  })
    .lean()
    .exec();
  for (const device of devices) {
    logger.info(`[DEVICEREPO] Device ${device.uuid} seems offline`);
    await DeviceDownTimeEventRepo.create(device);
    await DeviceModel.updateOne(
      { uuid: device.uuid },
      {
        $set: { status: DeviceStatus.OFFLINE },
      },
    )
      .lean()
      .exec();
  }
}

async function deleteByUuid(uuid: string): Promise<void> {
  await DeviceModel.deleteOne({ uuid: uuid }).exec();
}

export default {
  create,
  update,
  findOneByUuid,
  findAll,
  setDeviceOfflineAfter,
  findOneByIp,
  findByUuids,
  deleteByUuid,
};
