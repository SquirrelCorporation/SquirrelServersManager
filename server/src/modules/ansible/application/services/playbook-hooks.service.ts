import { Injectable } from '@nestjs/common';
import { TaskHookDto } from '../../presentation/dtos/task-hook.dto';
import { TaskEventDto } from '../../presentation/dtos/task-event.dto';
import { AnsibleTaskRepository } from '../../infrastructure/repositories/ansible-task.repository';
import { AnsibleTaskStatusRepository } from '../../infrastructure/repositories/ansible-task-status.repository';
import { AnsibleLogsRepository } from '../../../logs/repositories/ansible-logs.repository';
import { BadRequestError, NotFoundError } from '../../../../middlewares/api/ApiError';
import { isFinalStatus } from '../../../../helpers/ansible/AnsibleTaskHelper';
import { SshKeyService } from '../../../shell';

@Injectable()
export class PlaybookHooksService {
  constructor(
    private readonly taskRepository: AnsibleTaskRepository,
    private readonly taskStatusRepository: AnsibleTaskStatusRepository,
    private readonly logsRepository: AnsibleLogsRepository,
    private readonly sshKeyService: SshKeyService,
  ) {}

  async addTaskStatus(taskHookDto: TaskHookDto) {
    if (!taskHookDto.runner_ident || !taskHookDto.status) {
      throw new BadRequestError('Missing task status or id');
    }

    const ident = taskHookDto.runner_ident;
    const status = taskHookDto.status;

    const ansibleTask = await this.taskRepository.updateStatus(ident, status);

    if (!ansibleTask) {
      throw new NotFoundError('Task not found');
    }

    await this.taskStatusRepository.create({
      taskIdent: ident,
      status: status,
      createdAt: new Date(),
    });

    if (isFinalStatus(status)) {
      if (ansibleTask.target && ansibleTask.target.length > 0) {
        ansibleTask.target?.map((e) =>
          this.sshKeyService.removeAnsibleTemporaryPrivateKey(e, ident),
        );
      } else {
        this.sshKeyService.removeAllAnsibleExecTemporaryPrivateKeys(ident);
      }
    }

    return { message: 'Task status updated successfully' };
  }

  async addTaskEvent(taskEventDto: TaskEventDto) {
    if (!taskEventDto.runner_ident) {
      throw new BadRequestError('Missing task id');
    }

    const removeEmptyLines = (str: string) =>
      str
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '')
        .join('\n');

    await this.logsRepository.create({
      ident: taskEventDto.runner_ident,
      content: taskEventDto.stdout ? removeEmptyLines(taskEventDto.stdout) : JSON.stringify(taskEventDto),
      logRunnerId: taskEventDto.uuid,
    });

    return { message: 'Task event logged successfully' };
  }
}