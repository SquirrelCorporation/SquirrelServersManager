import { Injectable } from '@nestjs/common';
import { ServerLogEntity } from '../../domain/entities/server-log.entity';
import { ServerLog, ServerLogDocument } from '../schemas/server-log.schema';

@Injectable()
export class ServerLogMapper {
  toDomain(persistenceModel: ServerLogDocument): ServerLogEntity {
    return {
      ...persistenceModel,
      _id: persistenceModel._id?.toString(),
    };
  }

  toPersistence(domainModel: Partial<ServerLogEntity>): Partial<ServerLog> {
    return {
      level: domainModel.level,
      time: domainModel.time,
      pid: domainModel.pid,
      hostname: domainModel.hostname,
      msg: domainModel.msg,
      req: domainModel.req,
      res: domainModel.res,
      err: domainModel.err,
    };
  }
}
