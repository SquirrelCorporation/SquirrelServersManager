import { Injectable } from '@nestjs/common';
import { IDeviceDownTimeEvent } from '../../domain/entities/device-downtime-event.entity';

@Injectable()
export class DeviceDownTimeEventRepositoryMapper {
  toDomain(persistenceModel: any): IDeviceDownTimeEvent | null {
    if (!persistenceModel) { return null; }

    return {
      _id: persistenceModel._id?.toString(),
      deviceId: persistenceModel.deviceId,
      finishedAt: persistenceModel.finishedAt,
      duration: persistenceModel.duration,
      createdAt: persistenceModel.createdAt,
      updatedAt: persistenceModel.updatedAt,
    };
  }

  toDomainList(persistenceModels: any[]): IDeviceDownTimeEvent[] | null {
    if (!persistenceModels) { return null; }

    return persistenceModels
      .map((model) => this.toDomain(model))
      .filter((model): model is IDeviceDownTimeEvent => model !== null);
  }
}