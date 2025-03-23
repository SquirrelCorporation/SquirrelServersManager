import { API, SsmAnsible } from 'ssm-shared-lib';
import { IUser } from '../../../users';
import { IAnsibleVault } from '../../../ansible-vaults';
import { Playbooks } from '../../../../types/typings';

export const ANSIBLE_COMMAND_BUILDER_SERVICE = 'ANSIBLE_COMMAND_BUILDER_SERVICE';

/**
 * Interface for the Ansible Command Builder Service
 */
export interface IAnsibleCommandBuilderService {
  /**
   * Sanitize inventory targets for Ansible
   * @param inventoryTargets Inventory targets
   * @returns Sanitized inventory string
   */
  sanitizeInventory(inventoryTargets: Playbooks.All & Playbooks.HostGroups): string;

  /**
   * Get inventory targets command line argument
   * @param inventoryTargets Inventory targets
   * @returns Command line argument for inventory targets
   */
  getInventoryTargets(inventoryTargets?: Playbooks.All & Playbooks.HostGroups): string;

  /**
   * Get log level command line argument
   * @param user User with log level settings
   * @returns Command line argument for log level
   */
  getLogLevel(user: IUser): string;

  /**
   * Get extra vars command line argument
   * @param extraVars Extra variables
   * @returns Command line argument for extra vars
   */
  getExtraVars(extraVars?: API.ExtraVars): string;

  /**
   * Get dry run command line argument based on execution mode
   * @param mode Execution mode
   * @returns Command line argument for dry run
   */
  getDryRun(mode: SsmAnsible.ExecutionMode): string;

  /**
   * Get vaults command line argument
   * @param vaults Ansible vaults
   * @returns Command line argument for vaults
   */
  getVaults(vaults?: Partial<IAnsibleVault>[]): string;

  /**
   * Build the full Ansible command
   * @param playbook Playbook path
   * @param uuid Execution UUID
   * @param inventoryTargets Inventory targets
   * @param user User executing the playbook
   * @param extraVars Extra variables
   * @param mode Execution mode
   * @param vaults Ansible vaults
   * @returns Full Ansible command
   */
  buildAnsibleCmd(
    playbook: string,
    uuid: string,
    inventoryTargets: (Playbooks.All & Playbooks.HostGroups) | undefined,
    user: IUser,
    extraVars?: API.ExtraVars,
    mode?: SsmAnsible.ExecutionMode,
    vaults?: IAnsibleVault[]
  ): string;
}