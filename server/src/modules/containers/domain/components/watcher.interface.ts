import { Component } from './component.interface';
import { SSMServicesTypes } from 'src/types/typings';

/**
 * Interface for watcher components
 */
export interface IWatcherComponent extends Component<SSMServicesTypes.ConfigurationWatcherSchema> {
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
  removeContainer(container: any): Promise<void>;

  /**
   * Start a container
   */
  startContainer(container: any): Promise<void>;

  /**
   * Stop a container
   */
  stopContainer(container: any): Promise<void>;

  /**
   * Restart a container
   */
  restartContainer(container: any): Promise<void>;

  /**
   * Pause a container
   */
  pauseContainer(container: any): Promise<void>;

  /**
   * Unpause a container
   */
  unpauseContainer(container: any): Promise<void>;

  /**
   * Kill a container
   */
  killContainer(container: any): Promise<void>;

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
    registry: Record<string, Component<SSMServicesTypes.ConfigurationSchema>>;
    watcher: Record<string, Component<SSMServicesTypes.ConfigurationSchema>>;
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
  findRegisteredDockerComponent(watcher: string): Component<SSMServicesTypes.ConfigurationSchema> | undefined;
}