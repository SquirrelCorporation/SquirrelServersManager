import { parse } from 'url';
import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TaskLogsService } from '../../application/services/task-logs.service';
import { TaskLogsQueryDto } from '../dtos/task-logs-query.dto';

@Controller('ansible/logs')
export class TaskLogsController {
  constructor(private readonly taskLogsService: TaskLogsService) {}

  @Get('tasks')
  async getAllTasks(@Req() req: Request, @Query() queryDto: TaskLogsQueryDto) {
    const realUrl = req.url;
    const urlParams = parse(realUrl, true).query;
    const current = urlParams.current ? parseInt(urlParams.current as string, 10) : 1;
    const pageSize = urlParams.pageSize ? parseInt(urlParams.pageSize as string, 10) : 10;

    const params = {
      sort: queryDto.sort,
      order: queryDto.order,
      current,
      pageSize,
      ident: queryDto.ident,
      status: queryDto.status,
      cmd: queryDto.cmd,
      sorter: queryDto.sorter ? JSON.parse(queryDto.sorter) : undefined,
      filter: queryDto.filter ? JSON.parse(queryDto.filter) : undefined,
    };

    const result = await this.taskLogsService.getAllTasks(params);

    return result;
  }

  @Get('tasks/:id/logs')
  async getTaskLogs(@Param('id') id: string) {
    const logs = await this.taskLogsService.getTaskLogs(id);
    return logs;
  }
}
