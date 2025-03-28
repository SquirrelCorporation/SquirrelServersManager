import { IAnsibleTaskStatus } from '../entities/ansible-task-status.entity';

export const ANSIBLE_TASK_STATUS_REPOSITORY = 'ANSIBLE_TASK_STATUS_REPOSITORY';

export interface IAnsibleTaskStatusRepository {
  create(taskStatus: Partial<IAnsibleTaskStatus>): Promise<IAnsibleTaskStatus>;
  findByTaskIdent(taskIdent: string): Promise<IAnsibleTaskStatus[]>;
  deleteAllByIdent(taskIdent: string): Promise<void>;
}
