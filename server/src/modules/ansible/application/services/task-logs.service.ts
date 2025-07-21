import { filterByFields, filterByQueryParams } from '@infrastructure/common/query/filter.util';
import { paginate } from '@infrastructure/common/query/pagination.util';
import { sortByFields } from '@infrastructure/common/query/sorter.util';
import { IAnsibleTask } from '@modules/ansible/domain/entities/ansible-task.entity';
import { ANSIBLE_LOGS_REPOSITORY, IAnsibleLogsRepository } from '@modules/logs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ITaskLogsService } from '../../domain/interfaces/task-logs-service.interface';
import {
  ANSIBLE_TASK_STATUS_REPOSITORY,
  IAnsibleTaskStatusRepository,
} from '../../domain/repositories/ansible-task-status.repository.interface';
import {
  ANSIBLE_TASK_REPOSITORY,
  IAnsibleTaskRepository,
} from '../../domain/repositories/ansible-task.repository.interface';
import { PaginatedResponseDto } from '../../presentation/dtos/task-response.dto';

/**
 * Service for managing Ansible task logs
 */
@Injectable()
export class TaskLogsService implements ITaskLogsService {
  private readonly logger = new Logger(TaskLogsService.name);

  constructor(
    @Inject(ANSIBLE_TASK_REPOSITORY)
    private readonly ansibleTaskRepository: IAnsibleTaskRepository,
    @Inject(ANSIBLE_LOGS_REPOSITORY)
    private readonly ansibleLogsRepository: IAnsibleLogsRepository,
    @Inject(ANSIBLE_TASK_STATUS_REPOSITORY)
    private readonly ansibleTaskStatusRepository: IAnsibleTaskStatusRepository,
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
  }): Promise<PaginatedResponseDto<IAnsibleTask>> {
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
      return new PaginatedResponseDto<IAnsibleTask>(dataSource, {
        total: totalBeforePaginate,
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
   * Get all task status by ident
   * @param ident - The task ident
   * @returns The task statuses
   */
  async getTaskStatuses(ident: string) {
    try {
      const events = await this.ansibleTaskStatusRepository.findByTaskIdent(ident);
      return events;
    } catch (error) {
      this.logger.error(`Error getting task logs for ${ident}`, error);
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

  /**
   * Delete a task and its logs
   * @param taskId - The task ID
   * @returns True if deletion was successful
   */
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

  /**
   * Clean old tasks and logs
   * @param days Number of days to keep tasks and logs for
   * @returns Number of tasks deleted
   */
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
