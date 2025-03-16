import { Component } from '../../../domain/components/component.interface';
import { Kind } from '../../../domain/components/kind.enum';
import { SSMServicesTypes } from '../../../../../types/typings.d';
import PinoLogger from '../../../../../logger';

const logger = PinoLogger.child({ module: 'AbstractRegistryComponent' }, { msgPrefix: '[ABSTRACT_REGISTRY] - ' });

/**
 * Abstract base component for all container registries
 * Provides common functionalities for registry components
 */
export abstract class AbstractRegistryComponent implements Component<SSMServicesTypes.ConfigurationSchema> {
  protected id: string;
  protected name: string;
  protected provider: string;
  protected kind: Kind;
  protected configuration: SSMServicesTypes.ConfigurationSchema;

  constructor() {
    this.kind = Kind.REGISTRY;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getProvider(): string {
    return this.provider;
  }

  getKind(): Kind {
    return this.kind;
  }

  /**
   * Register the component
   */
  async register(
    id: string,
    kind: Kind,
    provider: string,
    name: string,
    configuration: SSMServicesTypes.ConfigurationSchema
  ): Promise<Component<SSMServicesTypes.ConfigurationSchema>> {
    logger.info(`Registering registry component ${provider}/${name}`);
    this.id = `${kind}.${provider}.${name}`;
    this.kind = kind;
    this.provider = provider;
    this.name = name;
    this.configuration = { ...configuration };

    await this.setup();

    return this;
  }

  /**
   * Deregister the component
   */
  async deregister(): Promise<void> {
    logger.info(`Deregistering registry component ${this.provider}/${this.name}`);
    await this.cleanup();
  }

  /**
   * Update the component configuration
   */
  async update(configuration: SSMServicesTypes.ConfigurationSchema): Promise<Component<SSMServicesTypes.ConfigurationSchema>> {
    logger.info(`Updating registry component ${this.provider}/${this.name}`);
    this.configuration = { ...configuration };
    
    // Perform any necessary updates based on new configuration
    await this.onConfigurationUpdated();
    
    return this;
  }

  /**
   * Setup the component after registration
   * To be implemented by specific registry implementations
   */
  protected abstract setup(): Promise<void>;

  /**
   * Clean up the component before deregistration
   * To be implemented by specific registry implementations
   */
  protected abstract cleanup(): Promise<void>;

  /**
   * Handle configuration updates
   * To be implemented by specific registry implementations
   */
  protected abstract onConfigurationUpdated(): Promise<void>;

  /**
   * List all images in the registry
   * To be implemented by specific registry implementations
   */
  abstract listImages(): Promise<any[]>;

  /**
   * Search for images in the registry
   * To be implemented by specific registry implementations
   */
  abstract searchImages(query: string): Promise<any[]>;

  /**
   * Get image information
   * To be implemented by specific registry implementations
   */
  abstract getImageInfo(imageName: string, tag?: string): Promise<any>;

  /**
   * Test connection to the registry
   * To be implemented by specific registry implementations
   */
  abstract testConnection(): Promise<boolean>;
}