import { IWatcherComponent } from './watcher.interface';

/**
 * Interface for Docker listener component
 * Extends the base watcher component with Docker event listening capabilities
 */
export interface IDockerListenerComponent extends IWatcherComponent {
  /**
   * Listen to Docker events
   */
  listenDockerEvents(): Promise<void>;
}

/**
 * Interface for Docker networks component
 * Extends the Docker listener component with network management
 */
export interface IDockerNetworksComponent extends IDockerListenerComponent {
  /**
   * Watch Docker networks
   */
  watchNetworksFromCron(): Promise<any[]>;

  /**
   * Get network by ID
   */
  getNetwork(networkId: string): Promise<any>;

  /**
   * Create a Docker network
   */
  createNetwork(networkConfig: any): Promise<any>;

  /**
   * Remove a Docker network
   */
  removeNetwork(network: any): Promise<void>;
}

/**
 * Interface for Docker volumes component
 * Extends the Docker networks component with volume management
 */
export interface IDockerVolumesComponent extends IDockerNetworksComponent {
  /**
   * Watch Docker volumes
   */
  watchVolumesFromCron(): Promise<void>;

  /**
   * Backup a Docker volume
   */
  backupVolume(
    volumeName: string,
    backupPath: string,
    fileName: string,
    emitEvent: boolean,
  ): Promise<string>;
}

/**
 * Interface for Docker images component
 * Extends the Docker volumes component with image management
 */
export interface IDockerImagesComponent extends IDockerVolumesComponent {
  /**
   * Watch Docker images
   */
  watchImagesFromCron(): Promise<any[]>;

  /**
   * Get image by ID or reference
   */
  getImage(imageId: string): Promise<any>;

  /**
   * Pull a Docker image
   */
  pullImage(imageTag: string): Promise<any>;

  /**
   * Remove a Docker image
   */
  removeImage(image: any): Promise<void>;
}

/**
 * Interface for Docker logs component
 * Extends the Docker images component with log management
 */
export interface IDockerLogsComponent extends IDockerImagesComponent {
  /**
   * Get logs for a container with specific options
   */
  getContainerLogs(container: any, options?: any): Promise<any>;

  /**
   * Stream logs in real-time
   */
  streamContainerLogs(container: any, options?: any): Promise<any>;
}

/**
 * Interface for the Docker watcher component factory
 */
export interface IDockerWatcherComponentFactory {
  /**
   * Create a complete Docker watcher component
   */
  createDockerWatcherComponent();
}
