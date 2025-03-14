import { IPlaybook } from '../../domain/entities/playbook.entity';

export const PLAYBOOKS_SERVICE = 'PLAYBOOKS_SERVICE';

/**
 * Interface for the playbooks service
 */
export interface IPlaybooksService {
  /**
   * Get a playbook by UUID
   * @param uuid Playbook UUID
   * @returns The playbook or undefined if not found
   */
  getPlaybook(uuid: string): Promise<IPlaybook | undefined>;
  
  /**
   * Get all playbooks
   * @returns Array of playbooks
   */
  getPlaybooks(): Promise<IPlaybook[]>;
  
  /**
   * Find a playbook by path
   * @param path File path
   * @returns The playbook or undefined if not found
   */
  findPlaybookByPath(path: string): Promise<IPlaybook | undefined>;
  
  /**
   * Save a playbook
   * @param uuid Playbook UUID
   * @param content Playbook content
   * @param registerUuid Register UUID
   * @returns The saved playbook
   */
  savePlaybook(uuid: string, content: string, registerUuid: string): Promise<IPlaybook>;
  
  /**
   * Delete a playbook
   * @param uuid Playbook UUID
   */
  deletePlaybook(uuid: string): Promise<void>;
  
  /**
   * Get playbooks by register UUID
   * @param registerUuid Register UUID
   * @returns Array of playbooks belonging to the register
   */
  getPlaybooksByRegister(registerUuid: string): Promise<IPlaybook[]>;
}