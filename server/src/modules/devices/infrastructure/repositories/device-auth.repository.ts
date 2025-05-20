import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDeviceAuthRepository } from '../../domain/repositories/device-auth-repository.interface';
import { IDeviceAuth } from '../../domain/entities/device-auth.entity';
import { IDevice } from '../../domain/entities/device.entity';
import { DEVICE_AUTH, DeviceAuthDocument } from '../schemas/device-auth.schema';

@Injectable()
export class DeviceAuthRepository implements IDeviceAuthRepository {
  private readonly logger = new Logger(DeviceAuthRepository.name);

  constructor(@InjectModel(DEVICE_AUTH) private deviceAuthModel: Model<DeviceAuthDocument>) {}

  // Helper method to transform MongoDB document to domain entity
  private toDomainEntity(doc: DeviceAuthDocument | null): IDeviceAuth | null {
    if (!doc) {
      return null;
    }
    return doc.toObject ? doc.toObject() : (doc as unknown as IDeviceAuth);
  }

  // Helper method to transform an array of MongoDB documents to domain entities
  private toDomainEntities(docs: DeviceAuthDocument[]): IDeviceAuth[] {
    return docs
      .map((doc) => this.toDomainEntity(doc))
      .filter((doc): doc is IDeviceAuth => doc !== null);
  }

  async create(deviceAuth: Partial<IDeviceAuth>): Promise<IDeviceAuth> {
    const _deviceAuth = await this.deviceAuthModel.create(deviceAuth);
    return this.toDomainEntity(_deviceAuth) as IDeviceAuth;
  }

  async updateOrCreateIfNotExist(deviceAuth: IDeviceAuth): Promise<IDeviceAuth> {
    const _deviceAuth = await this.deviceAuthModel.findOneAndUpdate(
      { device: deviceAuth.device },
      deviceAuth,
      { upsert: true, new: true },
    );
    const result = this.toDomainEntity(_deviceAuth);
    if (!result) {
      throw new Error('Failed to create or update device auth');
    }
    return result;
  }

  async update(deviceAuth: IDeviceAuth): Promise<IDeviceAuth | undefined> {
    const _deviceAuth = await this.deviceAuthModel.findOneAndUpdate(
      { device: deviceAuth.device },
      deviceAuth,
      { new: true },
    );
    return this.toDomainEntity(_deviceAuth) || undefined;
  }

  async findOneByDevice(device: IDevice): Promise<IDeviceAuth | null> {
    const result = await this.deviceAuthModel.findOne({ device }).lean().exec();
    return result as unknown as IDeviceAuth;
  }

  async findOneByDeviceUuid(uuid: string): Promise<IDeviceAuth[] | null> {
    const devicesAuth = await this.deviceAuthModel
      .find()
      .populate({ path: 'device', match: { uuid: { $eq: uuid } } })
      .exec();
    const filtered = devicesAuth.filter((deviceAuth) => deviceAuth.device != null);
    return this.toDomainEntities(filtered);
  }

  async findManyByDevicesUuid(uuids: string[]): Promise<IDeviceAuth[] | null> {
    const devicesAuth = await this.deviceAuthModel
      .find()
      .populate({ path: 'device', match: { uuid: { $in: uuids } } })
      .exec();

    const filtered = devicesAuth.filter((deviceAuth) => deviceAuth.device != null);
    return this.toDomainEntities(filtered);
  }

  async findAllPop(): Promise<IDeviceAuth[] | null> {
    const results = await this.deviceAuthModel.find().populate({ path: 'device' }).exec();
    return this.toDomainEntities(results).filter((deviceAuth) => deviceAuth.device != null);
  }

  async findAllPopWithSshKey(): Promise<IDeviceAuth[] | null> {
    const results = await this.deviceAuthModel
      .find({ sshKey: { $ne: null } })
      .populate({ path: 'device' })
      .exec();

    return this.toDomainEntities(results);
  }

  async deleteByDevice(device: IDevice): Promise<void> {
    await this.deviceAuthModel.deleteOne({ device }).exec();
  }

  async deleteCa(deviceAuth: IDeviceAuth): Promise<void> {
    await this.deviceAuthModel
      .updateOne({ device: deviceAuth.device }, { $unset: { dockerCa: 1 } })
      .exec();
  }

  async deleteCert(deviceAuth: IDeviceAuth): Promise<void> {
    await this.deviceAuthModel
      .updateOne({ device: deviceAuth.device }, { $unset: { dockerCert: 1 } })
      .exec();
  }

  async deleteKey(deviceAuth: IDeviceAuth): Promise<void> {
    await this.deviceAuthModel
      .updateOne({ device: deviceAuth.device }, { $unset: { dockerKey: 1 } })
      .exec();
  }
}
