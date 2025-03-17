export const CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE = 'CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE';

export interface IRepositoryError {
  message: string;
  timestamp: Date;
  code: string;
}

export interface IRepositorySyncStatus {
  lastSync: Date;
  status: 'success' | 'failed' | 'in_progress' | 'never';
}

export interface IContainerStacksRepositoryEngineService {
  // Repository operations
  cloneRepository(url: string, destination: string): Promise<boolean>;
  pullRepository(repositoryPath: string): Promise<boolean>;
  getRepositoryComponents(repositoryPath: string): Promise<string[]>;

  // Error handling
  resetError(uuid: string): Promise<boolean>;
  getLastError(uuid: string): Promise<IRepositoryError | null>;

  // Sync operations
  init(): Promise<void>;
  syncAllRegistered(): Promise<void>;
  syncRepository(uuid: string): Promise<boolean>;
  getLastSyncStatus(uuid: string): Promise<IRepositorySyncStatus>;
}