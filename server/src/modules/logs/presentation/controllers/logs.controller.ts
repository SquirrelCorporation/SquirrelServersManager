import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import {
  IServerLogsService,
  SERVER_LOGS_SERVICE,
} from '../../application/interfaces/server-logs-service.interface';
import { ServerLogsQueryDto } from '../dtos/server-logs-query.dto';

@Controller('logs')
@UseGuards(JwtAuthGuard)
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
