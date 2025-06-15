import { API } from 'ssm-shared-lib';

/**
 * Interface for smart failure service
 */
export const SMART_FAILURE_SERVICE = 'ISmartFailureService';

export interface ISmartFailureService {
  /**
   * Parse Ansible logs and extract smart failure information
   * @param execId Execution ID of the Ansible run
   * @returns Smart failure information if found, undefined otherwise
   */
  parseAnsibleLogsAndMayGetSmartFailure(execId: string): Promise<API.SmartFailure | undefined>;
}
