import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { TaskHookDto } from '../dtos/task-hook.dto';
import { TaskEventDto } from '../dtos/task-event.dto';
import { PlaybookHooksService } from '../../application/services/playbook-hooks.service';
import { SuccessResponse } from '../utils/api-response';

@Controller('ansible/hooks')
export class PlaybookHooksController {
  constructor(private readonly playbookHooksService: PlaybookHooksService) {}

  @Post('task-status')
  async addTaskStatus(@Body() taskHookDto: TaskHookDto, @Res() res: Response) {
    const result = await this.playbookHooksService.addTaskStatus(taskHookDto);
    new SuccessResponse(result, result.message).send(res);
  }

  @Post('task-event')
  async addTaskEvent(@Body() taskEventDto: TaskEventDto, @Res() res: Response) {
    const result = await this.playbookHooksService.addTaskEvent(taskEventDto);
    new SuccessResponse(result, result.message).send(res);
  }
}