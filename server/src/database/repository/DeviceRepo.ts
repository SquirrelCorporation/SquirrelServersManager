import Device, { DeviceModel } from '../model/Device';
import { Types } from 'mongoose';

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
  return DeviceModel.findOne({ uuid: uuid })
    .lean()
    .exec();
}

async function findAll() : Promise<Device[] | null> {
  return DeviceModel.find()
    .sort({ created_at: -1 })
    .lean()
    .exec();
}

export default {
  create,
  update,
  findOneById,
  findAll
};
