import { TaskHookDto } from '../../presentation/dtos/task-hook.dto';
import { TaskEventDto } from '../../presentation/dtos/task-event.dto';

export const ANSIBLE_HOOKS_SERVICE = 'ANSIBLE_HOOKS_SERVICE';

/**
 * Interface for the Ansible Hooks Service
 */
export interface IAnsibleHooksService {
  /**
   * Add a task status update
   * @param taskHookDto Task hook data
   * @returns Response message
   */
  addTaskStatus(taskHookDto: TaskHookDto): Promise<{ message: string }>;

  /**
   * Add a task event
   * @param taskEventDto Task event data
   * @returns Response message
   */
  addTaskEvent(taskEventDto: TaskEventDto): Promise<{ message: string }>;
}