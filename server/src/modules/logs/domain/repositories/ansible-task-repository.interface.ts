import { AnsibleTaskEntity } from '../entities/ansible-task.entity';

export interface IAnsibleTaskRepository {
  create(ansibleTask: Partial<AnsibleTaskEntity>): Promise<AnsibleTaskEntity>;
  updateStatus(ident: string, status: string): Promise<any>;
  findAll(): Promise<AnsibleTaskEntity[]>;
  findAllOld(ageInMinutes: number): Promise<AnsibleTaskEntity[]>;
  deleteAllTasksAndStatuses(ansibleTask: AnsibleTaskEntity): Promise<void>;
  deleteAllOldLogsAndStatuses(ageInMinutes: number): Promise<void>;
}
