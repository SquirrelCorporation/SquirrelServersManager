import { IUser } from '@modules/users';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { Playbooks } from 'src/types/typings';
import { IPlaybook } from '../../domain/entities/playbook.entity';

export const PLAYBOOKS_SERVICE = 'PLAYBOOKS_SERVICE';

/**
 * Interface for the playbooks service
 */
export interface IPlaybooksService {
  /**
   * Get a playbook by its quick reference
   * @param quickReference Playbook quick reference
   * @returns The playbook
   */
  getPlaybookByQuickReference(quickReference: string): Promise<IPlaybook | null>;

  /**
   * Get a playbook by its UUID
   * @param uuid Playbook UUID
   * @returns The playbook
   */
  getPlaybookByUuid(uuid: string): Promise<IPlaybook | null>;

  /**
   * Find a playbook by its unique quick reference
   * @param quickRef Quick reference string
   * @returns The playbook
   */
  findOneByUniqueQuickReference(quickRef: string): Promise<IPlaybook | null>;
  
  /**
   * Find a playbook by its name
   * @param name Playbook name
   * @returns The playbook
   */
  findOneByName(name: string): Promise<IPlaybook | null>;

  /**
   * Execute a playbook
   * @param playbook Playbook
   * @param user User
   * @param target Target
   * @param extraVarsForcedValues Extra vars forced values
   * @param mode Execution mode
   * @returns The execution result
   */
  executePlaybook(
    playbook: IPlaybook,
    user: IUser,
    target: string[] | undefined,
    extraVarsForcedValues?: API.ExtraVars,
    mode?: SsmAnsible.ExecutionMode,
  ): Promise<string>;

  /**
   * Execute a playbook on an inventory
   * @param uuid Playbook UUID
   * @param inventory Inventory
   * @param user User
   * @returns The execution result
   */
  executePlaybookOnInventory(
    playbook: IPlaybook,
    user: IUser,
    inventoryTargets?: Playbooks.All & Playbooks.HostGroups,
    extraVarsForcedValues?: API.ExtraVars,
    execUuid?: string,
  ): Promise<string>;
}
