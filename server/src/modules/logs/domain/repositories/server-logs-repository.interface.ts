import { ServerLogEntity } from '../entities/server-log.entity';

export interface IServerLogsRepository {
  findAll(): Promise<ServerLogEntity[]>;
  deleteAllOld(ageInDays: number): Promise<void>;
  deleteAll(): Promise<void>;
}
