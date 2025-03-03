import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { ServerLogsQueryDto } from '../dto/server-logs-query.dto';
import { TaskIdParamDto } from '../dto/task-id-param.dto';
import { TaskLogsQueryDto } from '../dto/task-logs-query.dto';
import { ServerLogsService } from '../services/server-logs.service';
import { TaskLogsService } from '../services/task-logs.service';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(
    private readonly serverLogsService: ServerLogsService,
    private readonly taskLogsService: TaskLogsService,
  ) {}

  @Get('server')
  async getServerLogs(@Query() query: ServerLogsQueryDto) {
    return this.serverLogsService.getServerLogs(query);
  }

  @Get('tasks')
  async getTaskLogs(@Query() query: TaskLogsQueryDto) {
    return this.taskLogsService.getTaskLogs(query);
  }

  @Get('tasks/:id/events')
  async getTaskEvents(@Param() params: TaskIdParamDto) {
    return this.taskLogsService.getTaskEvents(params.id);
  }
}
