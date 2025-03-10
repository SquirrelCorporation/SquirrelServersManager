/**
 * Interface for Ansible logs repository
 */
export interface IAnsibleLogsRepository {
  /**
   * Find all logs by execution identifier
   * @param execId Execution ID
   * @returns Array of log entries or undefined if none found
   */
  findAllByIdent(execId: string): Promise<any[] | undefined>;
}