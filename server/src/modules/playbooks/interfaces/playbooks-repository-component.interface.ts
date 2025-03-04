import { SsmGit } from 'ssm-shared-lib';

/**
 * Base component interface for all playbooks repository components
 */
export interface IPlaybooksRepositoryComponent {
  uuid: string;
  name: string;
  directory: string;
  rootPath: string;
  
  delete(): Promise<void>;
  save(playbookUuid: string, content: string): Promise<void>;
  syncToDatabase(): Promise<number | undefined>;
  updateDirectoriesTree(): Promise<any>;
  fileBelongToRepository(path: string): boolean;
  getDirectory(): string;
}

/**
 * Git component interface with Git-specific operations
 */
export interface IGitPlaybooksRepositoryComponent extends IPlaybooksRepositoryComponent {
  init(): Promise<void>;
  syncFromRepository(): Promise<void>;
  commitAndSync(): Promise<void>;
  createDirectory(path: string): Promise<void>;
  createPlaybook(fullPath: string, name: string): Promise<any>;
  deletePlaybook(playbookUuid: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
}

/**
 * Local component interface with local-specific operations
 */
export interface ILocalPlaybooksRepositoryComponent extends IPlaybooksRepositoryComponent {
  init(): Promise<void>;
  syncFromRepository(): Promise<void>;
}

/**
 * Options for creating a Git repository component
 */
export interface GitComponentOptions {
  uuid: string;
  name: string;
  branch: string;
  email: string;
  gitUserName: string;
  accessToken: string;
  remoteUrl: string;
  gitService: SsmGit.Services;
  ignoreSSLErrors: boolean;
}

/**
 * Options for creating a Local repository component
 */
export interface LocalComponentOptions {
  uuid: string;
  name: string;
  directory: string;
} 