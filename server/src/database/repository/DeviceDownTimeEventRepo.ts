import Device, { DeviceModel } from '../model/Device';
import DeviceDownTimeEvent, { DeviceDownTimeEventModel } from '../model/DeviceDownTimeEvent';
import logger from '../../logger';

async function create(device: Device): Promise<DeviceDownTimeEvent> {
  const createdDeviceDownTimeEvent = await DeviceDownTimeEventModel.create({ device: device });
  return createdDeviceDownTimeEvent.toObject();
}

async function closeDownTimeEvent(device: Device): Promise<void> {
  const deviceDownTimeEvent = await DeviceDownTimeEventModel.findOne({
    device: device,
    finishedAt: undefined,
  })
    .lean()
    .exec();
  if (!deviceDownTimeEvent) {
    logger.error(
      `[DeviceDownTimeEventRepo][CloseDownTimeEvent] Opened event not found for device ${device.uuid}`,
    );
    return;
  }
  await DeviceDownTimeEventModel.updateOne(
    { _id: deviceDownTimeEvent._id },
    {
      finishedAt: new Date(),
      duration: new Date().getTime() - deviceDownTimeEvent.createdAt.getTime(),
    },
  ).exec();
}

async function sumTotalDownTimePerDeviceOnPeriod(
  from: Date,
  to: Date,
): Promise<[{ _id: string; duration: number }]> {
  return (await DeviceDownTimeEventModel.aggregate([
    {
      $match: {
        finishedAt: { $exists: true, $lte: to },
        createdAt: { $gte: from },
      },
    },
    {
      $group: {
        _id: '$device',
        duration: { $sum: '$duration' },
      },
    },
  ]).exec()) as [{ _id: string; duration: number }];
}

async function deleteManyByDevice(device: Device) {
  await DeviceDownTimeEventModel.deleteMany({ device: device }).exec();
}

export default {
  create,
  closeDownTimeEvent,
  sumTotalDownTimePerDeviceOnPeriod,
  deleteManyByDevice,
};
