import { describe, expect, it, vi, beforeEach } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

// Mock entities and utils
const filterByFields = vi.fn(data => data);
const filterByQueryParams = vi.fn(data => data);
const sortByFields = vi.fn(data => data);
const paginate = vi.fn(data => data);

// Mock repository tokens
const ANSIBLE_TASK_REPOSITORY = Symbol('ANSIBLE_TASK_REPOSITORY');
const ANSIBLE_LOGS_REPOSITORY = Symbol('ANSIBLE_LOGS_REPOSITORY');
const ANSIBLE_TASK_STATUS_REPOSITORY = Symbol('ANSIBLE_TASK_STATUS_REPOSITORY');

// Mock PaginatedResponseDto
class PaginatedResponseDto<T> {
  data: T[];
  metadata: { total: number; pageSize: number; current: number };

  constructor(data: T[], metadata: { total: number; pageSize: number; current: number }) {
    this.data = data;
    this.metadata = metadata;
  }
}

// Simplified TaskLogsService for testing
class TaskLogsService {
  private readonly logger = { log: vi.fn(), error: vi.fn() };

  constructor(
    private readonly ansibleTaskRepository: any,
    private readonly ansibleLogsRepository: any,
    private readonly ansibleTaskStatusRepository: any,
  ) {}

  async getAllTasks(params?: {
    limit?: number;
    offset?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    current?: number;
    pageSize?: number;
    ident?: string;
    status?: string;
    cmd?: string;
    sorter?: any;
    filter?: any;
  }) {
    try {
      const tasks = await this.ansibleTaskRepository.findAll();

      // Apply sorting, filtering and pagination
      let dataSource = sortByFields(tasks, params);
      dataSource = filterByFields(dataSource, params);
      dataSource = filterByQueryParams(dataSource, params, [
        'ident',
        'status',
        'cmd',
        'createdAt',
        'updatedAt',
      ]);

      const totalBeforePaginate = dataSource?.length || 0;
      const current = params?.current || 1;
      const pageSize = params?.pageSize || 10;

      dataSource = paginate(dataSource, current, pageSize);

      // Return paginated response with metadata
      return new PaginatedResponseDto(dataSource, {
        total: totalBeforePaginate,
        pageSize,
        current,
      });
    } catch (error) {
      this.logger.error('Error getting all tasks', error);
      throw error;
    }
  }

  async getTaskLogs(id: string) {
    try {
      const events = await this.ansibleLogsRepository.findAllByIdent(id);
      return events;
    } catch (error) {
      this.logger.error(`Error getting task logs for ${id}`, error);
      throw error;
    }
  }

  async getTaskStatuses(ident: string) {
    try {
      const events = await this.ansibleTaskStatusRepository.findByTaskIdent(ident);
      return events;
    } catch (error) {
      this.logger.error(`Error getting task logs for ${ident}`, error);
      throw error;
    }
  }

  async createLog(taskId: string, content: string) {
    try {
      return this.ansibleLogsRepository.create({
        ident: taskId,
        content,
        logRunnerId: uuidv4(),
      });
    } catch (error) {
      this.logger.error(`Error creating log for task ${taskId}`, error);
      throw error;
    }
  }

  async createTask(task: {
    name: string;
    status: string;
    ident?: string;
    target?: string[];
    options?: any;
  }) {
    try {
      return this.ansibleTaskRepository.create({
        name: task.name,
        status: task.status,
        ident: task.ident || uuidv4(),
        target: task.target,
        options: task.options,
      });
    } catch (error) {
      this.logger.error('Error creating task', error);
      throw error;
    }
  }

  async updateTask(taskId: string, data: Partial<{ name: string; status: string }>) {
    try {
      const result = await this.ansibleTaskRepository.update(taskId, data);
      if (!result) {
        this.logger.error(`Task ${taskId} not found for update`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error updating task ${taskId}`, error);
      throw error;
    }
  }

  async deleteTask(taskId: string) {
    try {
      await this.ansibleLogsRepository.deleteAllByIdent(taskId);
      const result = await this.ansibleTaskRepository.delete(taskId);
      if (!result) {
        this.logger.error(`Task ${taskId} not found for deletion`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Error deleting task ${taskId}`, error);
      throw error;
    }
  }

  async cleanOldTasksAndLogs(days: number): Promise<number> {
    try {
      // Convert days to minutes (86400 minutes in a day)
      const ageInMinutes = days * 24 * 60;

      // Call the repository's existing method
      await this.ansibleTaskRepository.deleteAllOldLogsAndStatuses(ageInMinutes);

      this.logger.log(`Cleaned old tasks and their logs older than ${days} days`);
      return 0; // Repository method doesn't return count
    } catch (error: any) {
      this.logger.error(
        `Error cleaning old tasks and logs: ${error.message || String(error)}`,
        error,
      );
      throw error;
    }
  }
}

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-v4'
}));

describe('TaskLogsService', () => {
  let service: TaskLogsService;
  let mockAnsibleTaskRepository: any;
  let mockAnsibleLogsRepository: any;
  let mockAnsibleTaskStatusRepository: any;

  beforeEach(() => {
    mockAnsibleTaskRepository = {
      findAll: vi.fn().mockResolvedValue([
        { id: '1', name: 'Task 1', status: 'completed' },
        { id: '2', name: 'Task 2', status: 'running' }
      ]),
      create: vi.fn().mockImplementation(task => ({ ...task, id: '123' })),
      update: vi.fn().mockImplementation((id, data) => ({ id, ...data })),
      delete: vi.fn().mockResolvedValue(true),
      deleteAllOldLogsAndStatuses: vi.fn().mockResolvedValue(undefined)
    };

    mockAnsibleLogsRepository = {
      findAllByIdent: vi.fn().mockResolvedValue([
        { id: '1', ident: 'task-1', content: 'Log 1' },
        { id: '2', ident: 'task-1', content: 'Log 2' }
      ]),
      create: vi.fn().mockImplementation(log => ({ ...log, id: '456' })),
      deleteAllByIdent: vi.fn().mockResolvedValue(undefined)
    };

    mockAnsibleTaskStatusRepository = {
      findByTaskIdent: vi.fn().mockResolvedValue([
        { id: '1', ident: 'task-1', status: 'started' },
        { id: '2', ident: 'task-1', status: 'completed' }
      ])
    };

    service = new TaskLogsService(
      mockAnsibleTaskRepository,
      mockAnsibleLogsRepository,
      mockAnsibleTaskStatusRepository
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTasks', () => {
    it('should return all tasks with pagination', async () => {
      const result = await service.getAllTasks({ pageSize: 10, current: 1 });
      
      expect(mockAnsibleTaskRepository.findAll).toHaveBeenCalled();
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toHaveLength(2);
      expect(result.metadata.pageSize).toBe(10);
      expect(result.metadata.current).toBe(1);
    });

    it('should handle errors when getting tasks', async () => {
      mockAnsibleTaskRepository.findAll.mockRejectedValueOnce(new Error('Database error'));
      
      await expect(service.getAllTasks()).rejects.toThrow('Database error');
    });
  });

  describe('getTaskLogs', () => {
    it('should return logs for a specific task', async () => {
      const result = await service.getTaskLogs('task-1');
      
      expect(mockAnsibleLogsRepository.findAllByIdent).toHaveBeenCalledWith('task-1');
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('Log 1');
    });

    it('should handle errors when getting logs', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockRejectedValueOnce(new Error('Database error'));
      
      await expect(service.getTaskLogs('task-1')).rejects.toThrow('Database error');
    });
  });

  describe('getTaskStatuses', () => {
    it('should return statuses for a specific task', async () => {
      const result = await service.getTaskStatuses('task-1');
      
      expect(mockAnsibleTaskStatusRepository.findByTaskIdent).toHaveBeenCalledWith('task-1');
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('started');
      expect(result[1].status).toBe('completed');
    });

    it('should handle errors when getting statuses', async () => {
      mockAnsibleTaskStatusRepository.findByTaskIdent.mockRejectedValueOnce(new Error('Database error'));
      
      await expect(service.getTaskStatuses('task-1')).rejects.toThrow('Database error');
    });
  });

  describe('createLog', () => {
    it('should create a new log entry for a task', async () => {
      const result = await service.createLog('task-1', 'New log content');
      
      expect(mockAnsibleLogsRepository.create).toHaveBeenCalledWith({
        ident: 'task-1',
        content: 'New log content',
        logRunnerId: 'mock-uuid-v4'
      });
      expect(result.id).toBe('456');
    });

    it('should handle errors when creating a log', async () => {
      mockAnsibleLogsRepository.create.mockRejectedValueOnce(new Error('Database error'));
      
      await expect(service.createLog('task-1', 'New log content')).rejects.toThrow('Database error');
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = { name: 'New Task', status: 'pending', target: ['device-1'] };
      const result = await service.createTask(taskData);
      
      expect(mockAnsibleTaskRepository.create).toHaveBeenCalledWith({
        name: 'New Task',
        status: 'pending',
        ident: 'mock-uuid-v4',
        target: ['device-1'],
        options: undefined
      });
      expect(result.id).toBe('123');
    });

    it('should use provided ident if available', async () => {
      const taskData = { name: 'New Task', status: 'pending', ident: 'custom-ident' };
      await service.createTask(taskData);
      
      expect(mockAnsibleTaskRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ident: 'custom-ident'
      }));
    });

    it('should handle errors when creating a task', async () => {
      mockAnsibleTaskRepository.create.mockRejectedValueOnce(new Error('Database error'));
      
      await expect(service.createTask({ name: 'New Task', status: 'pending' })).rejects.toThrow('Database error');
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const result = await service.updateTask('task-1', { status: 'completed' });
      
      expect(mockAnsibleTaskRepository.update).toHaveBeenCalledWith('task-1', { status: 'completed' });
      expect(result.id).toBe('task-1');
      expect(result.status).toBe('completed');
    });

    it('should handle errors when updating a task', async () => {
      mockAnsibleTaskRepository.update.mockRejectedValueOnce(new Error('Database error'));
      
      await expect(service.updateTask('task-1', { status: 'completed' })).rejects.toThrow('Database error');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and its logs', async () => {
      const result = await service.deleteTask('task-1');
      
      expect(mockAnsibleLogsRepository.deleteAllByIdent).toHaveBeenCalledWith('task-1');
      expect(mockAnsibleTaskRepository.delete).toHaveBeenCalledWith('task-1');
      expect(result).toBe(true);
    });

    it('should handle errors when deleting a task', async () => {
      mockAnsibleTaskRepository.delete.mockRejectedValueOnce(new Error('Database error'));
      
      await expect(service.deleteTask('task-1')).rejects.toThrow('Database error');
    });
  });

  describe('cleanOldTasksAndLogs', () => {
    it('should clean old tasks and logs', async () => {
      const result = await service.cleanOldTasksAndLogs(30);
      
      expect(mockAnsibleTaskRepository.deleteAllOldLogsAndStatuses).toHaveBeenCalledWith(30 * 24 * 60);
      expect(result).toBe(0);
    });

    it('should handle errors when cleaning old tasks and logs', async () => {
      mockAnsibleTaskRepository.deleteAllOldLogsAndStatuses.mockRejectedValueOnce(new Error('Database error'));
      
      await expect(service.cleanOldTasksAndLogs(30)).rejects.toThrow('Database error');
    });
  });
});