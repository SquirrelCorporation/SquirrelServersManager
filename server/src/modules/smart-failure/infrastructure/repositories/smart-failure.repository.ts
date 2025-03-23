import { Inject, Injectable } from '@nestjs/common';
import { ANSIBLE_LOGS_REPOSITORY, IAnsibleLogsRepository } from '@modules/logs';
import { ISmartFailureRepository } from '../../domain/repositories/smart-failure.repository.interface';

/**
 * Implementation of Ansible logs repository
 */
@Injectable()
export class SmartFailureRepository implements ISmartFailureRepository {
  constructor(
    @Inject(ANSIBLE_LOGS_REPOSITORY)
    private readonly logsRepository: IAnsibleLogsRepository,
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
