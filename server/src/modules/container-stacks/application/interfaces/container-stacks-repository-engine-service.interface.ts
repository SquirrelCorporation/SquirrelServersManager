export const CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE = 'CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE';

export interface IContainerStacksRepositoryEngineService {
  cloneRepository(url: string, destination: string): Promise<boolean>;
  pullRepository(repositoryPath: string): Promise<boolean>;
  getRepositoryComponents(repositoryPath: string): Promise<string[]>;
}