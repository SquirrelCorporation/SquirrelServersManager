import { Body, Controller, Post } from '@nestjs/common';
import { TaskHookDto } from '../dtos/task-hook.dto';
import { TaskEventDto } from '../dtos/task-event.dto';
import { AnsibleHooksService } from '../../application/services/ansible-hooks.service';

@Controller('ansible/hooks/tasks')
export class AnsibleHooksController {
  constructor(private readonly playbookHooksService: AnsibleHooksService) {}

  @Post('status')
  async updateTaskStatus(@Body() taskHookDto: TaskHookDto) {
    const result = await this.playbookHooksService.addTaskStatus(taskHookDto);
    return result;
  }

  @Post('events')
  async createTaskEvent(@Body() taskEventDto: TaskEventDto) {
    const result = await this.playbookHooksService.addTaskEvent(taskEventDto);
    return result;
  }
}