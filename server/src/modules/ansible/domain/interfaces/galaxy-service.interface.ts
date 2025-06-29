export const GALAXY_SERVICE = 'GALAXY_SERVICE';

/**
 * Interface for the Galaxy Service
 */
export interface IGalaxyService {
  /**
   * Install a collection from Ansible Galaxy
   * @param namespace - The collection namespace
   * @param name - The collection name
   * @returns The installation result
   */
  installCollection(namespace: string, name: string): Promise<void>;

  /**
   * List collections
   * @returns List of collections
   */
  getAnsibleGalaxyCollections(
    offset: number,
    pageSize: number,
    current: number,
    namespace?: string,
    content?: string,
  ): Promise<any[]>;
}
