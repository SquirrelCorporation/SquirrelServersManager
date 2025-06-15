export const ADVANCED_OPERATIONS_SERVICE = 'ADVANCED_OPERATIONS_SERVICE';

/**
 * Interface for the Advanced Operations Service
 */
export interface IAdvancedOperationsService {
  /**
   * Restart the server
   */
  restartServer(): Promise<void>;

  /**
   * Delete all logs
   */
  deleteLogs(): Promise<void>;

  /**
   * Delete all Ansible logs
   */
  deleteAnsibleLogs(): Promise<void>;

  /**
   * Delete playbooks model and resync
   */
  deletePlaybooksModelAndResync(): Promise<void>;
}
