import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateTime } from 'luxon';
import { SsmStatus } from 'ssm-shared-lib';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DEVICE_WENT_OFFLINE_EVENT } from '@modules/statistics';
import { IDeviceRepository } from '../../domain/repositories/device-repository.interface';
import { IDevice } from '../../domain/entities/device.entity';
import { DEVICE, DeviceDocument } from '../schemas/device.schema';
import { DeviceRepositoryMapper } from '../mappers/device-repository.mapper';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'DeviceRepository' });

@Injectable()
export class DeviceRepository implements IDeviceRepository {
  constructor(
    @InjectModel(DEVICE) private deviceModel: Model<DeviceDocument>,
    private readonly mapper: DeviceRepositoryMapper,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(device: IDevice): Promise<IDevice> {
    const createdDevice = await this.deviceModel.create(device);
    return this.mapper.toDomain(createdDevice.toObject()) as IDevice;
  }

  async update(device: IDevice): Promise<IDevice | null> {
    device.updatedAt = new Date();
    const updated = await this.deviceModel
      .findOneAndUpdate({ uuid: device.uuid }, device, { new: true })
      .lean()
      .exec();
    return this.mapper.toDomain(updated);
  }

  async findOneByUuid(uuid: string): Promise<IDevice | null> {
    const device = await this.deviceModel.findOne({ uuid }).lean().exec();
    return this.mapper.toDomain(device);
  }

  async findByUuids(uuids: string[]): Promise<IDevice[] | null> {
    const devices = await this.deviceModel
      .find({ uuid: { $in: uuids } })
      .lean()
      .exec();
    return this.mapper.toDomainList(devices);
  }

  async findOneByIp(ip: string): Promise<IDevice | null> {
    const device = await this.deviceModel.findOne({ ip }).lean().exec();
    return this.mapper.toDomain(device);
  }

  async findAll(): Promise<IDevice[] | null> {
    const devices = await this.deviceModel
      .find({ disabled: false })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return this.mapper.toDomainList(devices);
  }

  async setDeviceOfflineAfter(inactivityInMinutes: number): Promise<void> {
    const devices = await this.deviceModel
      .find({
        updatedAt: { $lt: DateTime.now().minus({ minute: inactivityInMinutes }).toJSDate() },
        $and: [
          { status: { $ne: SsmStatus.DeviceStatus.OFFLINE } },
          { status: { $ne: SsmStatus.DeviceStatus.UNMANAGED } },
          { status: { $ne: SsmStatus.DeviceStatus.REGISTERING } },
        ],
      })
      .lean()
      .exec();

    for (const device of devices) {
      logger.info(`Device ${device.uuid} seems offline`);

      // Emit event for DeviceDownTimeService to handle
      this.eventEmitter.emit(DEVICE_WENT_OFFLINE_EVENT, device.uuid);

      await this.deviceModel
        .updateOne(
          { uuid: device.uuid },
          {
            $set: { status: SsmStatus.DeviceStatus.OFFLINE },
          },
        )
        .lean()
        .exec();
    }
  }

  async deleteByUuid(uuid: string): Promise<void> {
    await this.deviceModel.deleteOne({ uuid }).exec();
  }

  async findWithFilter(filter: any): Promise<IDevice[] | null> {
    const devices = await this.deviceModel.find(filter).lean().exec();
    return this.mapper.toDomainList(devices);
  }
}
