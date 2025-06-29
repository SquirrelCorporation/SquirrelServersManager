import { AnsibleLogEntity } from '../entities/ansible-log.entity';

export const ANSIBLE_LOGS_REPOSITORY = 'ANSIBLE_LOGS_REPOSITORY';

/**
 * Repository interface for ansible logs operations
 */
export interface IAnsibleLogRepository {
  create(ansibleLog: Partial<AnsibleLogEntity>): Promise<AnsibleLogEntity | null>;
  findAllByIdent(ident: string, sortDirection?: 1 | -1): Promise<AnsibleLogEntity[] | null>;
  deleteAllByIdent(ident: string): Promise<any>;
  deleteAll(): Promise<void>;
  findByExecutionId(executionId: string): Promise<AnsibleLogEntity[] | null>;
}

// For backward compatibility
export type IAnsibleLogsRepository = IAnsibleLogRepository;
