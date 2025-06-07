/**
 * Interface defining the required behavior for all playbooks register components
 */
export interface IPlaybooksRegisterComponent {
  /**
   * Component name
   */
  name: string;

  /**
   * Directory where playbooks are stored
   */
  directory: string;

  /**
   * Unique identifier for the component
   */
  uuid: string;

  /**
   * Root path for playbooks storage
   */
  rootPath: string;

  /**
   * Initialize the component
   */
  init(): Promise<void>;

  /**
   * Delete the component and clean up resources
   */
  delete(): Promise<void>;

  /**
   * Save a playbook
   * @param playbookUuid Playbook UUID
   * @param content Playbook content
   */
  save(playbookUuid: string, content: string): Promise<void>;

  /**
   * Synchronize playbooks to the database
   * @returns Number of playbooks synchronized
   */
  syncToDatabase(): Promise<number>;

  /**
   * Update the directories tree structure
   * @returns Tree structure
   */
  updateDirectoriesTree(): Promise<any>;

  /**
   * Check if a file belongs to this repository
   * @param path File path
   * @returns True if the file belongs to this repository
   */
  fileBelongToRepository(path: string): boolean;

  /**
   * Get the component directory
   * @returns Directory path
   */
  getDirectory(): string;
}
