import { Inject, Injectable } from '@nestjs/common';
import { ANSIBLE_LOGS_REPOSITORY, IAnsibleLogsRepository } from '@modules/logs';
import { ISshKeyService, SSH_KEY_SERVICE } from '@modules/shell';
import { IAnsibleHooksService } from '@modules/ansible/application/interfaces/ansible-hooks-service.interface';
import { isFinalStatus } from '@infrastructure/common/ansible/ansible-task.util';
import {
  ANSIBLE_TASK_REPOSITORY,
  IAnsibleTaskRepository,
} from '../../domain/repositories/ansible-task.repository.interface';
import {
  ANSIBLE_TASK_STATUS_REPOSITORY,
  IAnsibleTaskStatusRepository,
} from '../../domain/repositories/ansible-task-status.repository.interface';
import { BadRequestError, NotFoundError } from '../../../../middlewares/api/ApiError';
import { TaskEventDto } from '../../presentation/dtos/task-event.dto';
import { TaskHookDto } from '../../presentation/dtos/task-hook.dto';

@Injectable()
export class AnsibleHooksService implements IAnsibleHooksService {
  constructor(
    @Inject(ANSIBLE_TASK_REPOSITORY)
    private readonly taskRepository: IAnsibleTaskRepository,
    @Inject(ANSIBLE_TASK_STATUS_REPOSITORY)
    private readonly taskStatusRepository: IAnsibleTaskStatusRepository,
    @Inject(ANSIBLE_LOGS_REPOSITORY)
    private readonly logsRepository: IAnsibleLogsRepository,
    @Inject(SSH_KEY_SERVICE)
    private readonly sshKeyService: ISshKeyService,
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
      content: taskEventDto.stdout
        ? removeEmptyLines(taskEventDto.stdout)
        : JSON.stringify(taskEventDto),
      logRunnerId: taskEventDto.uuid,
      stdout: taskEventDto.stdout,
    });

    return { message: 'Task event logged successfully' };
  }
}
