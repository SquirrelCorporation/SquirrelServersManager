import { Inject, Injectable } from '@nestjs/common';
import { IAnsibleLogsRepository } from '../../domain/repositories/ansible-logs.repository.interface';
import { AnsibleLogsRepository as LogsModuleAnsibleLogsRepository } from '../../../logs/infrastructure/repositories/ansible-logs.repository';

/**
 * Implementation of Ansible logs repository
 */
@Injectable()
export class AnsibleLogsRepository implements IAnsibleLogsRepository {
  constructor(
    @Inject(LogsModuleAnsibleLogsRepository)
    private readonly logsRepository: LogsModuleAnsibleLogsRepository
  ) {}

  /**
   * Find all logs by execution identifier
   * @param execId Execution ID
   * @returns Array of log entries or undefined if none found
   */
  async findAllByIdent(execId: string): Promise<any[] | undefined> {
    const logs = await this.logsRepository.findAllByIdent(execId);
    return logs || undefined;
  }
}