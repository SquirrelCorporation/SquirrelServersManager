import { IAnsibleTaskStatus } from '../entities/ansible-task-status.interface';

export interface IAnsibleTaskStatusRepository {
  create(taskStatus: Partial<IAnsibleTaskStatus>): Promise<IAnsibleTaskStatus>;
  findByTaskIdent(taskIdent: string): Promise<IAnsibleTaskStatus[]>;
  deleteAllByIdent(taskIdent: string): Promise<void>;
}