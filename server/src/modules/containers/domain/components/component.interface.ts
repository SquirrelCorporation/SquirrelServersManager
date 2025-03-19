import { ConfigurationAuthenticationSchema, ConfigurationRegistrySchema, ConfigurationTriggerSchema, ConfigurationWatcherSchema } from '@modules/containers/types';
import { Kind } from './kind.enum';

/**
 * Base component interface for all container-related components
 */
export interface Component<
  T extends
    |ConfigurationRegistrySchema
    |ConfigurationTriggerSchema
    |ConfigurationWatcherSchema
    |ConfigurationAuthenticationSchema,
> {
  /**
   * Get the component's ID
   */
  getId(): string;

  /**
   * Get the component's name
   */
  getName(): string;

  /**
   * Get the component's provider
   */
  getProvider(): string;

  /**
   * Get the component's kind (WATCHER or REGISTRY)
   */
  getKind(): Kind;

  /**
   * Register the component
   */
  register(id: string, kind: Kind, provider: string, name: string, configuration: T): Promise<Component<T>>;

  /**
   * Deregister the component
   */
  deregister(): Promise<void>;

  /**
   * Update the component's configuration
   */
  update(configuration: T): Promise<Component<T>>;
}