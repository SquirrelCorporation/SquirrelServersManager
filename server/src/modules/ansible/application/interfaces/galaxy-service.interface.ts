export const GALAXY_SERVICE = 'GALAXY_SERVICE';

/**
 * Interface for the Galaxy Service
 */
export interface IGalaxyService {
  /**
   * Search for collections in Ansible Galaxy
   * @param query - The search query
   * @returns List of matching collections
   */
  searchCollections(query: string): Promise<any[]>;

  /**
   * Install a collection from Ansible Galaxy
   * @param namespace - The collection namespace
   * @param name - The collection name
   * @param version - The collection version (optional)
   * @returns The installation result
   */
  installCollection(namespace: string, name: string, version?: string): Promise<string>;

  /**
   * List installed collections
   * @returns List of installed collections
   */
  listInstalledCollections(): Promise<any[]>;
}