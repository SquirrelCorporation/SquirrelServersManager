import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { TaskLogsService } from '../services/task-logs.service';

@Controller('ansible/logs')
@UseGuards(JwtAuthGuard)
export class TaskLogsController {
  constructor(private readonly taskLogsService: TaskLogsService) {}

  @Get('tasks')
  async getTaskLogs(@Req() req, @Res() res) {
    return this.taskLogsService.getTaskLogs(req, res);
  }

  @Get('tasks/:id/events')
  async getTaskEvents(@Req() req, @Res() res) {
    return this.taskLogsService.getTaskEvents(req, res);
  }
}
