import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock utilities
const isFinalStatus = vi.fn(status => ['success', 'failed', 'error'].includes(status));

// Mock repository tokens
const ANSIBLE_TASK_REPOSITORY = Symbol('ANSIBLE_TASK_REPOSITORY');
const ANSIBLE_TASK_STATUS_REPOSITORY = Symbol('ANSIBLE_TASK_STATUS_REPOSITORY');
const ANSIBLE_LOGS_REPOSITORY = Symbol('ANSIBLE_LOGS_REPOSITORY');
const SSH_KEY_SERVICE = Symbol('SSH_KEY_SERVICE');

// Mock exceptions
class BadRequestException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestException';
  }
}

class EntityNotFoundException extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'EntityNotFoundException';
  }
}

// Data transfer objects
interface TaskHookDto {
  runner_ident: string;
  status: string;
}

interface TaskEventDto {
  runner_ident: string;
  uuid: string;
  stdout?: string;
}

// Simplified AnsibleHooksService for testing
class AnsibleHooksService {
  constructor(
    private readonly taskRepository: any,
    private readonly taskStatusRepository: any,
    private readonly logsRepository: any,
    private readonly sshKeyService: any,
  ) {}

  async addTaskStatus(taskHookDto: TaskHookDto) {
    if (!taskHookDto.runner_ident || !taskHookDto.status) {
      throw new BadRequestException('Missing task status or id');
    }

    const ident = taskHookDto.runner_ident;
    const status = taskHookDto.status;

    const ansibleTask = await this.taskRepository.updateStatus(ident, status);

    if (!ansibleTask) {
      throw new EntityNotFoundException('AnsibleTask', ident);
    }

    await this.taskStatusRepository.create({
      taskIdent: ident,
      status: status,
      createdAt: new Date(),
    });

    if (isFinalStatus(status)) {
      if (ansibleTask.target && ansibleTask.target.length > 0) {
        ansibleTask.target?.map((e: string) =>
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
      throw new BadRequestException('Missing task id');
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

describe('AnsibleHooksService', () => {
  let service: AnsibleHooksService;
  let mockTaskRepository: any;
  let mockTaskStatusRepository: any;
  let mockLogsRepository: any;
  let mockSshKeyService: any;

  beforeEach(() => {
    mockTaskRepository = {
      updateStatus: vi.fn().mockImplementation((ident, status) => {
        if (ident === 'non-existent') return null;
        return {
          id: '123',
          ident,
          status,
          target: ident === 'with-targets' ? ['target1', 'target2'] : []
        };
      })
    };

    mockTaskStatusRepository = {
      create: vi.fn().mockImplementation(data => ({ ...data, id: '456' }))
    };

    mockLogsRepository = {
      create: vi.fn().mockImplementation(data => ({ ...data, id: '789' }))
    };

    mockSshKeyService = {
      removeAnsibleTemporaryPrivateKey: vi.fn(),
      removeAllAnsibleExecTemporaryPrivateKeys: vi.fn()
    };

    service = new AnsibleHooksService(
      mockTaskRepository,
      mockTaskStatusRepository,
      mockLogsRepository,
      mockSshKeyService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addTaskStatus', () => {
    it('should update task status and create status record', async () => {
      const taskHookDto = { runner_ident: 'task-1', status: 'running' };
      const result = await service.addTaskStatus(taskHookDto);

      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith('task-1', 'running');
      expect(mockTaskStatusRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        taskIdent: 'task-1',
        status: 'running'
      }));
      expect(result.message).toBe('Task status updated successfully');
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      const taskHookDto = { runner_ident: '', status: '' };

      await expect(service.addTaskStatus(taskHookDto)).rejects.toThrow(BadRequestException);
      expect(mockTaskRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw EntityNotFoundException if task not found', async () => {
      const taskHookDto = { runner_ident: 'non-existent', status: 'running' };

      await expect(service.addTaskStatus(taskHookDto)).rejects.toThrow(EntityNotFoundException);
      expect(mockTaskStatusRepository.create).not.toHaveBeenCalled();
    });

    it('should remove temporary keys for specific targets when status is final', async () => {
      isFinalStatus.mockReturnValueOnce(true);
      const taskHookDto = { runner_ident: 'with-targets', status: 'success' };

      await service.addTaskStatus(taskHookDto);

      expect(mockSshKeyService.removeAnsibleTemporaryPrivateKey).toHaveBeenCalledTimes(2);
      expect(mockSshKeyService.removeAnsibleTemporaryPrivateKey).toHaveBeenCalledWith('target1', 'with-targets');
      expect(mockSshKeyService.removeAnsibleTemporaryPrivateKey).toHaveBeenCalledWith('target2', 'with-targets');
      expect(mockSshKeyService.removeAllAnsibleExecTemporaryPrivateKeys).not.toHaveBeenCalled();
    });

    it('should remove all temporary keys when status is final but no targets', async () => {
      isFinalStatus.mockReturnValueOnce(true);
      const taskHookDto = { runner_ident: 'task-1', status: 'failed' };

      await service.addTaskStatus(taskHookDto);

      expect(mockSshKeyService.removeAnsibleTemporaryPrivateKey).not.toHaveBeenCalled();
      expect(mockSshKeyService.removeAllAnsibleExecTemporaryPrivateKeys).toHaveBeenCalledWith('task-1');
    });
  });

  describe('addTaskEvent', () => {
    it('should log task event with stdout', async () => {
      const taskEventDto = {
        runner_ident: 'task-1',
        uuid: 'event-1',
        stdout: 'line 1\n\nline 2\n'
      };

      const result = await service.addTaskEvent(taskEventDto);

      expect(mockLogsRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ident: 'task-1',
        content: 'line 1\nline 2',
        logRunnerId: 'event-1',
        stdout: 'line 1\n\nline 2\n'
      }));
      expect(result.message).toBe('Task event logged successfully');
    });

    it('should log task event with stringify if no stdout', async () => {
      const taskEventDto = {
        runner_ident: 'task-1',
        uuid: 'event-1'
      };

      await service.addTaskEvent(taskEventDto);

      expect(mockLogsRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ident: 'task-1',
        content: JSON.stringify(taskEventDto),
        logRunnerId: 'event-1'
      }));
    });

    it('should throw BadRequestException if runner_ident is missing', async () => {
      const taskEventDto = { runner_ident: '', uuid: 'event-1' };

      await expect(service.addTaskEvent(taskEventDto)).rejects.toThrow(BadRequestException);
      expect(mockLogsRepository.create).not.toHaveBeenCalled();
    });
  });
});
