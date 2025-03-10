import { AnsibleLogEntity } from '../entities/ansible-log.entity';

export interface IAnsibleLogsRepository {
  create(ansibleLog: Partial<AnsibleLogEntity>): Promise<AnsibleLogEntity>;
  findAllByIdent(ident: string, sortDirection?: 1 | -1): Promise<AnsibleLogEntity[]>;
  deleteAllByIdent(ident: string): Promise<any>;
  deleteAll(): Promise<void>;
}
