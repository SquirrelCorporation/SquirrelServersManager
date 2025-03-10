import { ServerLogsQueryDto } from '../../presentation/dtos/server-logs-query.dto';

export const SERVER_LOGS_SERVICE = 'SERVER_LOGS_SERVICE';

export interface IServerLogsService {
  getServerLogs(params: ServerLogsQueryDto): Promise<any>;
}