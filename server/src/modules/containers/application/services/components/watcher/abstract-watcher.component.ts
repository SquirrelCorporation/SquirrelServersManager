import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigurationWatcherSchema } from '@modules/containers/types';
import { IComponent } from '../../../../domain/components/component.interface';
import { Kind } from '../../../../domain/components/kind.enum';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child(
  { module: 'AbstractWatcherComponent' },
  { msgPrefix: '[ABSTRACT_WATCHER] - ' },
);

/**
 * Abstract base component for all container watchers
 * Provides common functionalities for watchers
 */
@Injectable()
export abstract class AbstractWatcherComponent {
  protected id: string = 'unknown';
  protected name: string = 'unknown';
  protected provider: string = 'unknown';
  protected kind: Kind = Kind.WATCHER;
  protected configuration!: ConfigurationWatcherSchema;
  protected childLogger: any;
  protected joi = Joi;

  constructor() {
    this.kind = Kind.WATCHER;
    this.childLogger = logger;
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
    configuration: ConfigurationWatcherSchema,
  ): Promise<IComponent<ConfigurationWatcherSchema>> {
    this.childLogger.info(`Registering watcher component ${provider}/${name}`);
    this.id = `${kind}.${provider}.${name}`;
    this.kind = kind;
    this.provider = provider;
    this.name = name;
    this.configuration = { ...configuration };

    // Initialize component-specific settings
    await this.init();

    return this;
  }

  /**
   * Deregister the component
   */
  async deregister(): Promise<void> {
    this.childLogger.info(`Deregistering watcher component ${this.provider}/${this.name}`);
    await this.deregisterComponent();
  }

  /**
   * Update the component configuration
   */
  async update(
    configuration: ConfigurationWatcherSchema,
  ): Promise<IComponent<ConfigurationWatcherSchema>> {
    this.childLogger.info(`Updating watcher component ${this.provider}/${this.name}`);
    this.configuration = { ...configuration };

    // Perform any necessary updates based on new configuration
    await this.init();

    return this;
  }

  /**
   * Emit event from component
   * @param event
   * @param data
   */
  protected emit(event: string, data: any): void {
    this.childLogger.debug(`Emitting event ${event} - ${JSON.stringify(data)}`);
    // Events are handled by the NestJS event emitter in the actual implementation
  }

  /**
   * Configuration validation schema
   */
  abstract getConfigurationSchema(): Joi.ObjectSchema<any>;

  /**
   * Mask sensitive data
   */
  abstract maskConfiguration(): any;

  /**
   * Setup the watcher during registration
   */
  abstract init(): Promise<void>;

  /**
   * Clean up resources during deregistration
   */
  abstract deregisterComponent(): Promise<void>;

  /**
   * Get container by ID
   */
  abstract getContainer(containerId: string): Promise<any>;

  /**
   * List all containers
   */
  abstract listContainers(): Promise<any[]>;

  /**
   * Remove a container
   */
  abstract removeContainer(container: any): Promise<void>;

  /**
   * Start a container
   */
  abstract startContainer(container: any): Promise<void>;

  /**
   * Stop a container
   */
  abstract stopContainer(container: any): Promise<void>;

  /**
   * Restart a container
   */
  abstract restartContainer(container: any): Promise<void>;

  /**
   * Pause a container
   */
  abstract pauseContainer(container: any): Promise<void>;

  /**
   * Unpause a container
   */
  abstract unpauseContainer(container: any): Promise<void>;

  /**
   * Kill a container
   */
  abstract killContainer(container: any): Promise<void>;

  /**
   * Get container logs
   */
  abstract getContainerLogs(container: any, options?: any): Promise<any>;
}
