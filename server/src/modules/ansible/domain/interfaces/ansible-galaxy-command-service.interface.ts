export const ANSIBLE_GALAXY_COMMAND_SERVICE = 'ANSIBLE_GALAXY_COMMAND_SERVICE';

/**
 * Interface for the Ansible Galaxy Command Service
 */
export interface IAnsibleGalaxyCommandService {
  /**
   * Get command to install an Ansible collection
   * @param name Collection name
   * @param namespace Collection namespace
   * @returns Installation command string
   */
  getInstallCollectionCmd(name: string, namespace: string): string;

  /**
   * Get command to list Ansible collections
   * @returns List command string
   */
  getListCollectionsCmd(): string;
}
