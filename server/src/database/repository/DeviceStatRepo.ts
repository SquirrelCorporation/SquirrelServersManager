import mongoose from 'mongoose';
import { DateTime } from 'luxon';
import DeviceStat, { DeviceStatModel } from '../model/DeviceStat';
import Device from '../model/Device';
import logger from '../../logger';

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

async function findStatsByDevicesAndType(
  devices: Device[],
  type: string,
  from: Date,
  to: Date,
): Promise<[{ date: string; value: string; name: string }] | null> {
  const ObjectId = mongoose.Types.ObjectId;
  return (await DeviceStatModel.aggregate([
    {
      $match: {
        device: { $in: devices.map((e) => new ObjectId(e._id)) },
        createdAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: {
          device: '$device',
          byHour: { $dateToString: { format: '%Y-%m-%d-%H:00:00', date: '$createdAt' } },
        },
        averageValue: { $avg: `${type}` },
      },
    },
    {
      $lookup: {
        from: 'devices',
        localField: '_id.device',
        foreignField: '_id',
        as: 'fulldevice',
      },
    },
    { $unwind: '$fulldevice' },
    {
      $project: {
        _id: '',
        date: '$_id.byHour',
        value: '$averageValue',
        name: { $concat: ['$fulldevice.fqdn', ' - ', '$fulldevice.ip'] },
      },
    },
  ])
    .sort({ date: 1 })
    .exec()) as [{ date: string; value: string; name: string }] | null;
}

async function findSingleAveragedStatByDevicesAndType(
  devices: Device[],
  type: string,
  from: Date,
  to: Date,
): Promise<[{ value: string; name: string }] | null> {
  const ObjectId = mongoose.Types.ObjectId;
  logger.info(
    `[DEVICESTATREPO] - findSingleAveragedStatByDevicesAndType - from: ${from} - to: ${to}`,
  );
  return (await DeviceStatModel.aggregate([
    {
      $match: {
        device: { $in: devices.map((e) => new ObjectId(e._id)) },
        createdAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: { device: '$device' },
        averageValue: { $avg: `${type}` },
      },
    },
    {
      $lookup: {
        from: 'devices',
        localField: '_id.device',
        foreignField: '_id',
        as: 'fulldevice',
      },
    },
    { $unwind: '$fulldevice' },
    {
      $project: {
        _id: '',
        value: '$averageValue',
        name: { $concat: ['$fulldevice.fqdn', ' - ', '$fulldevice.ip'] },
      },
    },
  ])
    .sort({ value: -1 })
    .exec()) as [{ date: string; value: string; name: string }] | null;
}

async function findStatByDeviceAndType(
  device: Device,
  type: string,
): Promise<[{ _id: string; value: number; createdAt: string; name: string }] | null> {
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

async function findSingleAveragedStatAndType(
  type: string,
  from: number,
  to: number,
): Promise<[{ value: number }] | null> {
  return (await DeviceStatModel.aggregate([
    {
      $match: {
        createdAt: {
          $gt: DateTime.now().minus({ day: from }).toJSDate(),
          $lt: DateTime.now().minus({ day: to }).toJSDate(),
        },
      },
    },
    {
      $group: {
        _id: null,
        averageValue: { $avg: `${type}` },
      },
    },
    {
      $project: {
        value: '$averageValue',
      },
    },
  ]).exec()) as [{ value: number }] | null;
}

async function deleteManyByDevice(device: Device) {
  await DeviceStatModel.deleteMany({ device: device }).exec();
}

export default {
  create,
  findLatestStat,
  findStatsByDeviceAndType,
  findStatByDeviceAndType,
  findStatsByDevicesAndType,
  findSingleAveragedStatByDevicesAndType,
  findSingleAveragedStatAndType,
  deleteManyByDevice,
};
