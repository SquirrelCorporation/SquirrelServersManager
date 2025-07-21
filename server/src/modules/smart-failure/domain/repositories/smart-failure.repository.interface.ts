/**
 * Interface for Ansible logs repository
 */
export const SMART_FAILURE_REPOSITORY = 'ISmartFailureRepository';

export interface ISmartFailureRepository {
  /**
   * Find all logs by execution identifier
   * @param execId Execution ID
   * @returns Array of log entries or undefined if none found
   */
  findAllByIdent(execId: string): Promise<any[] | undefined>;
}
