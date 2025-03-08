export const CONTAINER_REPOSITORY_COMPONENT_SERVICE = 'CONTAINER_REPOSITORY_COMPONENT_SERVICE';

export interface IContainerRepositoryComponentService {
  getComponentDetails(repositoryPath: string, componentName: string): Promise<any>;
  deployComponent(repositoryPath: string, componentName: string, config: any): Promise<boolean>;
  removeComponent(repositoryPath: string, componentName: string): Promise<boolean>;
}