import { ServerLogEntity } from '../entities/server-log.entity';

export const SERVER_LOGS_REPOSITORY = 'IServerLogsRepository';

export interface IServerLogsRepository {
  findAll(): Promise<ServerLogEntity[]>;
  deleteAllOld(ageInDays: number): Promise<void>;
  deleteAll(): Promise<void>;
}
