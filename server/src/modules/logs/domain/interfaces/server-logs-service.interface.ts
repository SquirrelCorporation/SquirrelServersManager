import { ServerLogsQueryDto } from '../../presentation/dtos/server-logs-query.dto';

export const SERVER_LOGS_SERVICE = 'SERVER_LOGS_SERVICE';

export interface IServerLogsService {
  /**
   * Get server logs based on query parameters
   */
  getServerLogs(params: ServerLogsQueryDto): Promise<any>;

  /**
   * Delete all server logs
   */
  deleteAll(): Promise<void>;

  /**
   * Delete old server logs
   * @param days Number of days to keep logs for
   */
  deleteAllOld(days: number): Promise<void>;
}
