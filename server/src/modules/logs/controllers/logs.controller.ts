import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { ServerLogsQueryDto } from '../dto/server-logs-query.dto';
import { ServerLogsService } from '../services/server-logs.service';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(
    private readonly serverLogsService: ServerLogsService,
  ) {}

  @Get('server')
  async getServerLogs(@Query() query: ServerLogsQueryDto) {
    return this.serverLogsService.getServerLogs(query);
  }
}
