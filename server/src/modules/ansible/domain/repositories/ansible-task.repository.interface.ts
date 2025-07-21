import { IAnsibleTask } from '../entities/ansible-task.entity';

export const ANSIBLE_TASK_REPOSITORY = 'ANSIBLE_TASK_REPOSITORY';

export interface IAnsibleTaskRepository {
  create(task: Partial<IAnsibleTask>): Promise<IAnsibleTask>;
  findByIdent(ident: string): Promise<IAnsibleTask | null>;
  findById(id: string): Promise<IAnsibleTask | null>;
  updateStatus(ident: string, status: string): Promise<IAnsibleTask | null>;
  findAll(): Promise<IAnsibleTask[]>;
  update(id: string, data: Partial<IAnsibleTask>): Promise<IAnsibleTask | null>;
  delete(id: string): Promise<boolean>;
  deleteAllOldLogsAndStatuses(ageInMinutes: number): Promise<void>;
  findOlderThan(date: Date): Promise<IAnsibleTask[]>;
}
