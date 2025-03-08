import { Injectable } from '@nestjs/common';
import { IDevice } from '../../domain/entities/device.entity';

@Injectable()
export class DeviceRepositoryMapper {
  toDomain(document: any): IDevice | null {
    if (!document) {return null;}

    return {
      ...document,
      _id: document._id?.toString() || '',
    };
  }

  toDomainList(documents: any[]): IDevice[] {
    if (!documents) {return [];}
    return documents.map(doc => this.toDomain(doc)).filter((device): device is IDevice => device !== null);
  }
}