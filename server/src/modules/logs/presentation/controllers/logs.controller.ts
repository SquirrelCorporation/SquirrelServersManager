import { Controller, Get, Inject, Query } from '@nestjs/common';
import {
  IServerLogsService,
  SERVER_LOGS_SERVICE,
} from '../../application/interfaces/server-logs-service.interface';
import { ServerLogsQueryDto } from '../dtos/server-logs-query.dto';

@Controller('logs')
export class LogsController {
  constructor(
    @Inject(SERVER_LOGS_SERVICE)
    private readonly serverLogsService: IServerLogsService,
  ) {}

  @Get('server')
  async getServerLogs(@Query() query: ServerLogsQueryDto) {
    return this.serverLogsService.getServerLogs(query);
  }
}
