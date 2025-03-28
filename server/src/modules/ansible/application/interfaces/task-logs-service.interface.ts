import { AnsibleLogEntity } from '@modules/logs/domain/entities/ansible-log.entity';
import { IAnsibleTask } from '@modules/ansible/domain/entities/ansible-task.entity';
import { IAnsibleTaskStatus } from '../../domain/entities/ansible-task-status.entity';
import { PaginatedResponseDto } from '../../presentation/dtos/task-response.dto';

export const TASK_LOGS_SERVICE = 'TASK_LOGS_SERVICE';

/**
 * Interface for the Task Logs Service
 */
export interface ITaskLogsService {
  /**
   * Get all recorded ansible tasks
   * @param params Query parameters for filtering, sorting, and pagination
   * @returns List of all ansible tasks with pagination metadata
   */
  getAllTasks(params?: {
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
  }): Promise<PaginatedResponseDto<IAnsibleTask>>;

  /**
   * Get task logs for a specific task
   * @param id The task ID
   * @returns The task logs
   */
  getTaskLogs(id: string): Promise<AnsibleLogEntity[] | null>;

  /**
   * Get all task status by ident
   * @param ident The task ident
   * @returns The task statuses
   */
  getTaskStatuses(ident: string): Promise<IAnsibleTaskStatus[]>;

  /**
   * Create a new log entry for a task
   * @param taskId The task ID
   * @param content The log content
   * @returns The created log entry
   */
  createLog(taskId: string, content: string): Promise<AnsibleLogEntity | null>;

  /**
   * Create a new task entry
   * @param task The task data
   * @returns The created task
   */
  createTask(task: {
    name: string;
    status: string;
    ident?: string;
    target?: string[];
    options?: any;
  }): Promise<any>;

  /**
   * Update a task entry
   * @param taskId The task ID
   * @param update The update data
   * @returns The updated task
   */
  updateTask(taskId: string, data: Partial<{ name: string; status: string }>): Promise<any>;

  /**
   * Delete a task and its logs
   * @param taskId The task ID
   * @returns True if deletion was successful
   */
  deleteTask(taskId: string): Promise<boolean>;
}
