export const CONTAINER_REPOSITORY_COMPONENT_SERVICE = 'CONTAINER_REPOSITORY_COMPONENT_SERVICE';

export interface IComponentDetails {
  name: string;
  version: string;
  description?: string;
  configuration: {
    required: string[];
    optional: string[];
  };
  dependencies?: string[];
}

export interface IComponentConfig {
  variables: Record<string, string>;
  environment?: Record<string, string>;
  volumes?: Array<{
    source: string;
    target: string;
  }>;
}

export interface IContainerRepositoryComponentService {
  getComponentDetails(repositoryPath: string, componentName: string): Promise<IComponentDetails>;
  deployComponent(
    repositoryPath: string,
    componentName: string,
    config: IComponentConfig,
  ): Promise<boolean>;
  removeComponent(repositoryPath: string, componentName: string): Promise<boolean>;
}
