import { IAnsibleTask } from '../entities/ansible-task.interface';

export interface IAnsibleTaskRepository {
  create(task: Partial<IAnsibleTask>): Promise<IAnsibleTask>;
  findByIdent(ident: string): Promise<IAnsibleTask | null>;
  findById(id: string): Promise<IAnsibleTask | null>;
  updateStatus(ident: string, status: string): Promise<IAnsibleTask | null>;
  findAll(): Promise<IAnsibleTask[]>;
  update?(id: string, update: Partial<IAnsibleTask>): Promise<IAnsibleTask | null>;
  delete?(id: string): Promise<boolean>;
}