import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDeviceDownTimeEventRepository } from '../../domain/repositories/device-downtime-event-repository.interface';
import { IDeviceDownTimeEvent } from '../../domain/entities/device-downtime-event.entity';
import {
  DEVICE_DOWNTIME_EVENT,
  DeviceDownTimeEventDocument,
} from '../schemas/device-downtime-event.schema';
import { DeviceDownTimeEventRepositoryMapper } from '../mappers/device-downtime-event-repository.mapper';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'DeviceDownTimeEventRepository' });

@Injectable()
export class DeviceDownTimeEventRepository implements IDeviceDownTimeEventRepository {
  constructor(
    @InjectModel(DEVICE_DOWNTIME_EVENT)
    private downtimeEventModel: Model<DeviceDownTimeEventDocument>,
    private readonly mapper: DeviceDownTimeEventRepositoryMapper,
  ) {}

  async create(deviceId: string): Promise<IDeviceDownTimeEvent> {
    logger.info(`Creating downtime event for device: ${deviceId}`);
    const createdEvent = await this.downtimeEventModel.create({ deviceId });
    return this.mapper.toDomain(createdEvent.toObject())!;
  }

  async closeDownTimeEvent(deviceId: string): Promise<void> {
    logger.info(`Closing downtime event for device: ${deviceId}`);

    const downtimeEvent = await this.downtimeEventModel
      .findOne({
        deviceId,
        finishedAt: { $exists: false },
      })
      .lean()
      .exec();

    if (!downtimeEvent) {
      logger.debug(`No open downtime event found for device: ${deviceId}`);
      return;
    }

    const now = new Date();
    const createdDate = downtimeEvent.createdAt || new Date(0);
    const duration = now.getTime() - createdDate.getTime();

    await this.downtimeEventModel
      .updateOne(
        { _id: downtimeEvent._id },
        {
          finishedAt: now,
          duration,
        },
      )
      .exec();

    logger.info(`Closed downtime event for device: ${deviceId}, duration: ${duration}ms`);
  }

  async sumTotalDownTimePerDeviceOnPeriod(
    from: Date,
    to: Date,
  ): Promise<{ deviceId: string; duration: number }[]> {
    logger.info(`Calculating total downtime per device from ${from} to ${to}`);

    const result = await this.downtimeEventModel
      .aggregate([
        {
          $match: {
            finishedAt: { $exists: true, $lte: to },
            createdAt: { $gte: from },
          },
        },
        {
          $group: {
            _id: '$deviceId',
            duration: { $sum: '$duration' },
          },
        },
        {
          $project: {
            _id: 0,
            deviceId: '$_id',
            duration: 1,
          },
        },
      ])
      .exec();

    return result;
  }
}
