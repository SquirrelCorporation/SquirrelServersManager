import mongoose from 'mongoose';
import { DateTime } from 'luxon';
import DeviceStat, { DeviceStatModel } from '../model/DeviceStat';
import Device from '../model/Device';

async function create(deviceStat: DeviceStat): Promise<DeviceStat> {
  const createdDeviceStat = await DeviceStatModel.create(deviceStat);
  return createdDeviceStat.toObject();
}

async function findLatestStat(device: Device): Promise<DeviceStat | null> {
  return await DeviceStatModel.findOne({ device: device }).sort({ createdAt: -1 }).lean().exec();
}

//
async function findStatsByDeviceAndType(
  device: Device,
  type: string,
  from: number,
): Promise<DeviceStat[] | null> {
  const ObjectId = mongoose.Types.ObjectId;
  return await DeviceStatModel.aggregate([
    {
      $match: {
        device: new ObjectId(device._id),
        createdAt: { $gt: DateTime.now().minus({ hour: from }).toJSDate() },
      },
    },
    {
      $project: {
        date: '$createdAt',
        value: `${type}`,
      },
    },
  ])
    .sort({ date: 1 })
    .exec();
}

async function findStatByDeviceAndType(
  device: Device,
  type: string,
): Promise<[{ _id: string; value: number; createdAt: string }] | null> {
  const ObjectId = mongoose.Types.ObjectId;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return await DeviceStatModel.aggregate([
    {
      $match: { device: new ObjectId(device._id) },
    },
    {
      $sort: { createdAt: 1 },
    },
    {
      $group: {
        _id: '$device',
        value: { $last: `${type}` },
        date: { $last: '$createdAt' },
      },
    },
  ]).exec();
}

export default {
  create,
  findLatestStat,
  findStatsByDeviceAndType,
  findStatByDeviceAndType,
};
