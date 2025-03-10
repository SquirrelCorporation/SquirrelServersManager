import { Injectable } from '@nestjs/common';
import { ServerLogEntity } from '../../domain/entities/server-log.entity';
import { ServerLog } from '../schemas/server-log.schema';

@Injectable()
export class ServerLogMapper {
  toDomain(persistenceModel: ServerLog): ServerLogEntity {
    const entity = new ServerLogEntity();
    entity.level = persistenceModel.level;
    entity.time = persistenceModel.time;
    entity.pid = persistenceModel.pid;
    entity.hostname = persistenceModel.hostname;
    entity.msg = persistenceModel.msg;
    entity.req = persistenceModel.req;
    entity.res = persistenceModel.res;
    entity.err = persistenceModel.err;
    return entity;
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