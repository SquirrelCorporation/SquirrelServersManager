/**
 * Interface for Playbook file operations in the application layer
 */
export interface IPlaybookFileService {
  readPlaybook(path: string): string;
  editPlaybook(content: string, path: string): void;
  newPlaybook(path: string): void;
  deletePlaybook(path: string): void;
  testExistence(path: string): boolean;
  readConfigIfExists(path: string): any;
}