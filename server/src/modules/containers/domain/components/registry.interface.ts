import { ConfigurationRegistrySchema } from '@modules/containers/types';
import { IComponent } from './component.interface';

/**
 * Interface for registry components
 */
export interface IRegistryComponent extends IComponent<ConfigurationRegistrySchema> {
  /**
   * Get configuration schema for the registry
   */
  getConfigurationSchema(): any;

  /**
   * Mask sensitive configuration data
   */
  maskConfiguration(): any;
}

/**
 * Interface for the registry component factory
 */
export interface IRegistryComponentFactory {
  /**
   * Create a Docker Hub registry component
   */
  createDockerHubComponent(): IRegistryComponent;

  /**
   * Create a custom registry component
   */
  createCustomComponent(): IRegistryComponent;

  /**
   * Create a Google Container Registry component
   */
  createGcrComponent(): IRegistryComponent;

  /**
   * Create a GitHub Container Registry component
   */
  createGhcrComponent(): IRegistryComponent;

  /**
   * Create an Azure Container Registry component
   */
  createAcrComponent(): IRegistryComponent;

  /**
   * Create an Amazon ECR component
   */
  createEcrComponent(): IRegistryComponent;

  /**
   * Create a Quay registry component
   */
  createQuayComponent(): IRegistryComponent;

  /**
   * Create a GitLab registry component
   */
  createGitLabComponent(): IRegistryComponent;

  /**
   * Create a Gitea registry component
   */
  createGiteaComponent(): IRegistryComponent;

  /**
   * Create a Forgejo registry component
   */
  createForgejoComponent(): IRegistryComponent;

  /**
   * Create a Lineage OS Container Registry component
   */
  createLscrComponent(): IRegistryComponent;
}
