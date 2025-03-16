import { Component } from '../../../domain/components/component.interface';
import { Kind } from '../../../domain/components/kind.enum';
import { SSMServicesTypes } from '../../../../../types/typings.d';
import PinoLogger from '../../../../../logger';

const logger = PinoLogger.child({ module: 'AbstractWatcherComponent' }, { msgPrefix: '[ABSTRACT_WATCHER] - ' });

/**
 * Abstract base component for all container watchers
 * Provides common functionalities for watchers
 */
export abstract class AbstractWatcherComponent implements Component<SSMServicesTypes.ConfigurationSchema> {
  protected id: string;
  protected name: string;
  protected provider: string;
  protected kind: Kind;
  protected configuration: SSMServicesTypes.ConfigurationSchema;

  constructor() {
    this.kind = Kind.WATCHER;
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
    logger.info(`Registering watcher component ${provider}/${name}`);
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
    logger.info(`Deregistering watcher component ${this.provider}/${this.name}`);
    await this.cleanup();
  }

  /**
   * Update the component configuration
   */
  async update(configuration: SSMServicesTypes.ConfigurationSchema): Promise<Component<SSMServicesTypes.ConfigurationSchema>> {
    logger.info(`Updating watcher component ${this.provider}/${this.name}`);
    this.configuration = { ...configuration };
    
    // Perform any necessary updates based on new configuration
    await this.onConfigurationUpdated();
    
    return this;
  }

  /**
   * Setup the component after registration
   * To be implemented by specific watcher implementations
   */
  protected abstract setup(): Promise<void>;

  /**
   * Clean up the component before deregistration
   * To be implemented by specific watcher implementations
   */
  protected abstract cleanup(): Promise<void>;

  /**
   * Handle configuration updates
   * To be implemented by specific watcher implementations
   */
  protected abstract onConfigurationUpdated(): Promise<void>;

  /**
   * Get container by ID
   * To be implemented by specific watcher implementations
   */
  abstract getContainer(containerId: string): Promise<any>;

  /**
   * List all containers
   * To be implemented by specific watcher implementations
   */
  abstract listContainers(): Promise<any[]>;

  /**
   * Create a container
   * To be implemented by specific watcher implementations
   */
  abstract createContainer(containerConfig: SSMServicesTypes.CreateContainerParams): Promise<any>;

  /**
   * Remove a container
   * To be implemented by specific watcher implementations
   */
  abstract removeContainer(containerId: string): Promise<void>;

  /**
   * Start a container
   * To be implemented by specific watcher implementations
   */
  abstract startContainer(containerId: string): Promise<void>;

  /**
   * Stop a container
   * To be implemented by specific watcher implementations
   */
  abstract stopContainer(containerId: string): Promise<void>;

  /**
   * Restart a container
   * To be implemented by specific watcher implementations
   */
  abstract restartContainer(containerId: string): Promise<void>;

  /**
   * Pause a container
   * To be implemented by specific watcher implementations
   */
  abstract pauseContainer(containerId: string): Promise<void>;

  /**
   * Unpause a container
   * To be implemented by specific watcher implementations
   */
  abstract unpauseContainer(containerId: string): Promise<void>;

  /**
   * Kill a container
   * To be implemented by specific watcher implementations
   */
  abstract killContainer(containerId: string): Promise<void>;

  /**
   * Get container logs
   * To be implemented by specific watcher implementations
   */
  abstract getContainerLogs(containerId: string, options?: any): Promise<any>;
}