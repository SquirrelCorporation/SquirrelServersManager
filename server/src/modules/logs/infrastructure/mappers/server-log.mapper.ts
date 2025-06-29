import { Injectable } from '@nestjs/common';
import { ServerLogEntity } from '../../domain/entities/server-log.entity';
import { ServerLog } from '../schemas/server-log.schema';

@Injectable()
export class ServerLogMapper {
  toDomain(persistenceModel: any): ServerLogEntity {
    return {
      ...persistenceModel,
      _id: persistenceModel._id?.toString(),
    };
  }

  toPersistence(domainModel: Partial<ServerLogEntity>): Partial<ServerLog> {
    const document: any = { ...domainModel };

    return document;
  }
}
