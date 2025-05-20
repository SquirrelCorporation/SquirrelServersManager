export const ANSIBLE_LOGS_SERVICE = 'ANSIBLE_LOGS_SERVICE';

export interface IAnsibleLogsService {
  /**
   * Delete all ansible logs
   */
  deleteAll(): Promise<void>;
  
  /**
   * Get logs for a specific ansible execution
   * @param executionId The Ansible execution ID
   */
  getExecutionLogs(executionId: string): Promise<any>;
  
  /**
   * Find all logs for a specific ansible execution
   * @param ident The execution identifier
   * @param sortDirection Optional sort direction (1 for ascending, -1 for descending)
   */
  findAllByIdent(ident: string, sortDirection?: 1 | -1): Promise<any[] | null>;
}