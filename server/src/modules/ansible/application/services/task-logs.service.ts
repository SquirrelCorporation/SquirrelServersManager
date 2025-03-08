import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { paginate } from 'src/helpers/query/PaginationHelper';
import { filterByQueryParams } from 'src/helpers/query/FilterHelper';
import { filterByFields } from 'src/helpers/query/FilterHelper';
import { sortByFields } from 'src/helpers/query/SorterHelper';
import { AnsibleTaskRepository } from '../../infrastructure/repositories/ansible-task.repository';
import { AnsibleLogsRepository } from '../../../logs/repositories/ansible-logs.repository';
import { PaginatedResponseDto, TaskResponseDto } from '../../presentation/dtos/task-response.dto';

/**
 * Service for managing Ansible task logs
 */
@Injectable()
export class TaskLogsService {
  private readonly logger = new Logger(TaskLogsService.name);

  constructor(
    private readonly ansibleTaskRepository: AnsibleTaskRepository,
    private readonly ansibleLogsRepository: AnsibleLogsRepository,
  ) {}

  /**
   * Get all recorded ansible tasks
   * @returns List of all ansible tasks with pagination metadata
   */
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
  }): Promise<PaginatedResponseDto<TaskResponseDto>> {
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

      // Map to response DTO
      const taskDtos = dataSource.map(task => {
        const dto = new TaskResponseDto();
        dto.id = task._id || '';
        dto.ident = task.ident;
        dto.name = task.name;
        dto.playbook = task.playbook;
        dto.status = task.status;
        dto.target = task.target;
        dto.options = task.options;
        dto.createdAt = task.createdAt;
        dto.updatedAt = task.updatedAt;
        return dto;
      });

      // Return paginated response with metadata
      return new PaginatedResponseDto(taskDtos, {
        total: totalBeforePaginate,
        success: true,
        pageSize,
        current,
      });
    } catch (error) {
      this.logger.error('Error getting all tasks', error);
      throw error;
    }
  }

  /**
   * Get task logs for a specific task
   * @param id - The task ID
   * @returns The task logs
   */
  async getTaskLogs(id: string) {
    try {
      const events = await this.ansibleLogsRepository.findAllByIdent(id);
      return events;
    } catch (error) {
      this.logger.error(`Error getting task logs for ${id}`, error);
      throw error;
    }
  }

  /**
   * Create a new log entry for a task
   * @param taskId - The task ID
   * @param content - The log content
   * @returns The created log entry
   */
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

  /**
   * Create a new task entry
   * @param task - The task data
   * @returns The created task
   */
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

  /**
   * Update a task entry
   * @param taskId - The task ID
   * @param update - The update data
   * @returns The updated task
   */
  async updateTask(taskId: string, update: Partial<{ name: string; status: string }>) {
    try {
      return this.ansibleTaskRepository.update(taskId, update);
    } catch (error) {
      this.logger.error(`Error updating task ${taskId}`, error);
      throw error;
    }
  }

  /**
   * Delete a task and its logs
   * @param taskId - The task ID
   * @returns True if deletion was successful
   */
  async deleteTask(taskId: string) {
    try {
      await this.ansibleLogsRepository.deleteAllByIdent(taskId);
      return this.ansibleTaskRepository.delete(taskId);
    } catch (error) {
      this.logger.error(`Error deleting task ${taskId}`, error);
      throw error;
    }
  }
}