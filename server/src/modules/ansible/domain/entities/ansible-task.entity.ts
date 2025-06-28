/**
 * Domain entity for an Ansible task
 */
export interface IAnsibleTask {
  _id?: string;
  ident: string;
  name?: string;
  cmd?: string;
  playbook?: string;
  status: string;
  target?: string[];
  options?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
