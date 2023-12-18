import Device, {DeviceModel, DeviceStatus} from '../model/Device';
import { DateTime } from "luxon";
import logger from "../../logger";

async function create(device: Device): Promise<Device> {
  const createdDevice = await DeviceModel.create(device);
  return createdDevice.toObject();
}

async function update(device: Device): Promise<Device | null> {
  device.updatedAt = new Date();
  return DeviceModel.findOneAndUpdate({ uuid: device.uuid}, device, { new: true })
    .lean()
    .exec();
}

async function findOneById(uuid: string): Promise<Device | null> {
  return await DeviceModel.findOne({ uuid: uuid })
    .lean()
    .exec();
}

async function findOneByIp(ip: string): Promise<Device | null> {
  return await DeviceModel.findOne({ ip: ip })
      .lean()
      .exec();
}

async function findAll() : Promise<Device[] | null> {
  return await DeviceModel.find()
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}

async function setDeviceOfflineAfter(inactivityInMinutes : number) {
  await DeviceModel.updateMany(
    {
      updatedAt: { $lt: DateTime.now().minus({minute: inactivityInMinutes}).toJSDate() }
    },
    {
      $set: {status: DeviceStatus.OFFLINE}
    })
    .lean()
    .exec();
}

export default {
  create,
  update,
  findOneById,
  findAll,
  setDeviceOfflineAfter,
  findOneByIp
};
