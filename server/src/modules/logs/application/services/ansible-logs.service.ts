import { Inject, Injectable, Logger } from '@nestjs/common';
import { IAnsibleLogsService } from '../../domain/interfaces/ansible-logs-service.interface';
import {
  ANSIBLE_LOGS_REPOSITORY,
  IAnsibleLogsRepository,
} from '../../domain/repositories/ansible-logs-repository.interface';

@Injectable()
export class AnsibleLogsService implements IAnsibleLogsService {
  private readonly logger = new Logger(AnsibleLogsService.name);

  constructor(
    @Inject(ANSIBLE_LOGS_REPOSITORY)
    private readonly ansibleLogsRepository: IAnsibleLogsRepository,
  ) {}

  /**
   * Delete all ansible logs
   */
  async deleteAll(): Promise<void> {
    this.logger.log('Deleting all Ansible logs');
    return this.ansibleLogsRepository.deleteAll();
  }

  /**
   * Get logs for a specific ansible execution
   * @param executionId The Ansible execution ID
   */
  async getExecutionLogs(executionId: string): Promise<any> {
    this.logger.log(`Getting logs for Ansible execution: ${executionId}`);
    return this.ansibleLogsRepository.findByExecutionId(executionId);
  }

  /**
   * Find all logs for a specific ansible execution
   * @param ident The execution identifier
   * @param sortDirection Optional sort direction (1 for ascending, -1 for descending)
   */
  async findAllByIdent(ident: string, sortDirection?: 1 | -1): Promise<any[] | null> {
    this.logger.log(`Finding all logs for execution: ${ident}`);
    return this.ansibleLogsRepository.findAllByIdent(ident, sortDirection);
  }
}
