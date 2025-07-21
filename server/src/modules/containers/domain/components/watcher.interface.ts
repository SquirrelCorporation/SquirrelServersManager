import { IContainer } from '@modules/containers/domain/entities/container.entity';
import { ConfigurationSchema, ConfigurationWatcherSchema } from '@modules/containers/types';
import { IComponent } from './component.interface';

/**
 * Interface for watcher components
 */
export interface IWatcherComponent extends IComponent<ConfigurationWatcherSchema> {
  /**
   * Get container by ID
   */
  getContainer(containerId: string): Promise<any>;

  /**
   * List all containers
   */
  listContainers(): Promise<any[]>;

  /**
   * Create a new container
   */
  createContainer(containerConfig: any): Promise<any>;

  /**
   * Remove a container
   */
  removeContainer(container: IContainer): Promise<void>;

  /**
   * Start a container
   */
  startContainer(container: IContainer): Promise<void>;

  /**
   * Stop a container
   */
  stopContainer(container: IContainer): Promise<void>;

  /**
   * Restart a container
   */
  restartContainer(container: IContainer): Promise<void>;

  /**
   * Pause a container
   */
  pauseContainer(container: IContainer): Promise<void>;

  /**
   * Unpause a container
   */
  unpauseContainer(container: IContainer): Promise<void>;

  /**
   * Kill a container
   */
  killContainer(container: IContainer): Promise<void>;

  /**
   * Get container logs
   */
  getContainerLogs(container: any, options?: any): Promise<any>;
}

/**
 * Interface for the watcher component factory
 */
export interface IWatcherComponentFactory {
  /**
   * Create a Docker watcher component
   */
  createDockerComponent(): IWatcherComponent;

  /**
   * Create a Proxmox watcher component (for future implementation)
   */
  createProxmoxComponent(): IWatcherComponent;
}

/**
 * Interface for the watcher engine service
 */
export interface IWatcherEngineService {
  /**
   * Get all registered watcher states
   */
  getStates(): {
    registry: Record<string, IComponent<ConfigurationSchema>>;
    watcher: Record<string, IComponent<ConfigurationSchema>>;
  };

  /**
   * Register watchers from the database
   */
  registerWatchers(): Promise<boolean>;

  /**
   * Register a single watcher for a device
   */
  registerWatcher(device: any): Promise<void>;

  /**
   * Deregister all watchers
   */
  deregisterWatchers(): Promise<void>;

  /**
   * Find a registered Docker component
   */
  findRegisteredDockerComponent(watcher: string): IComponent<ConfigurationSchema> | undefined;
}
