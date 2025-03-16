import { Injectable } from '@nestjs/common';
import { AbstractWatcherComponent } from './abstract-watcher.component';
import { SSMServicesTypes } from '../../../../../types/typings.d';
import PinoLogger from '../../../../../logger';
import { ContainerService } from '../container.service';
import * as Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import { CronJob } from 'cron';

const logger = PinoLogger.child({ module: 'DockerWatcherComponent' }, { msgPrefix: '[DOCKER_WATCHER] - ' });

/**
 * Docker implementation of the container watcher component
 */
@Injectable()
export class DockerWatcherComponent extends AbstractWatcherComponent {
  private docker: Docker;
  private cronJob: CronJob | null = null;
  private statsJob: CronJob | null = null;
  private containersCache: Map<string, any> = new Map();
  private containerService: ContainerService;

  constructor(containerService: ContainerService) {
    super();
    this.containerService = containerService;
  }

  /**
   * Setup Docker client and start monitoring
   */
  protected async setup(): Promise<void> {
    try {
      logger.info(`Setting up Docker watcher for ${this.name}`);
      const { host } = this.configuration;
      
      // Create Docker client
      this.docker = new Docker({
        host,
        port: 2375, // Default Docker port
      });

      // Test connection
      await this.docker.ping();
      
      // Start cron jobs
      this.startWatchJobs();
      
      logger.info(`Docker watcher ${this.name} set up successfully`);
    } catch (error) {
      logger.error(`Failed to set up Docker watcher ${this.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up Docker watcher ${this.name}`);
    
    // Stop cron jobs
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    
    if (this.statsJob) {
      this.statsJob.stop();
      this.statsJob = null;
    }
    
    // Clear caches
    this.containersCache.clear();
    
    logger.info(`Docker watcher ${this.name} cleaned up`);
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating Docker watcher ${this.name} configuration`);
    
    // Stop existing cron jobs
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    
    if (this.statsJob) {
      this.statsJob.stop();
      this.statsJob = null;
    }
    
    // Recreate Docker client with new configuration
    const { host } = this.configuration;
    this.docker = new Docker({
      host,
      port: 2375,
    });
    
    // Restart cron jobs
    this.startWatchJobs();
    
    logger.info(`Docker watcher ${this.name} configuration updated`);
  }

  /**
   * Get a container by ID
   */
  async getContainer(containerId: string): Promise<any> {
    try {
      const container = this.docker.getContainer(containerId);
      const containerInfo = await container.inspect();
      return this.formatContainerInfo(containerInfo);
    } catch (error) {
      logger.error(`Failed to get container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all containers
   */
  async listContainers(): Promise<any[]> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      return Promise.all(containers.map(async (containerInfo) => {
        const container = this.docker.getContainer(containerInfo.Id);
        const details = await container.inspect();
        return this.formatContainerInfo(details);
      }));
    } catch (error) {
      logger.error(`Failed to list containers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a container
   */
  async createContainer(containerConfig: SSMServicesTypes.CreateContainerParams): Promise<any> {
    try {
      logger.info(`Creating container ${containerConfig.name}`);
      
      // Prepare Docker configuration
      const dockerConfig: Docker.ContainerCreateOptions = {
        Image: containerConfig.image,
        name: containerConfig.name,
        Env: this.prepareEnvironmentVariables(containerConfig.env),
        HostConfig: {
          PortBindings: this.preparePortBindings(containerConfig.ports),
          Binds: this.prepareVolumeBindings(containerConfig.volumes),
          RestartPolicy: {
            Name: containerConfig.restart || 'no',
          },
          Privileged: containerConfig.privileged || false,
        },
        Labels: containerConfig.labels || {},
      };
      
      if (containerConfig.command) {
        dockerConfig.Cmd = containerConfig.command.split(' ');
      }
      
      // Create the container
      const container = await this.docker.createContainer(dockerConfig);
      
      // Start the container if it was created successfully
      await container.start();
      
      // Inspect the container to get full details
      const details = await container.inspect();
      
      // Add UUID and format for our system
      const formattedContainer = this.formatContainerInfo(details);
      formattedContainer.uuid = uuidv4();
      
      return formattedContainer;
    } catch (error) {
      logger.error(`Failed to create container: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove a container
   */
  async removeContainer(containerId: string): Promise<void> {
    try {
      logger.info(`Removing container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      
      // Check if container is running
      const details = await container.inspect();
      if (details.State.Running) {
        // Stop the container first
        await container.stop();
      }
      
      // Remove the container
      await container.remove();
      
      logger.info(`Container ${containerId} removed`);
    } catch (error) {
      logger.error(`Failed to remove container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start a container
   */
  async startContainer(containerId: string): Promise<void> {
    try {
      logger.info(`Starting container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      await container.start();
      logger.info(`Container ${containerId} started`);
    } catch (error) {
      logger.error(`Failed to start container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop a container
   */
  async stopContainer(containerId: string): Promise<void> {
    try {
      logger.info(`Stopping container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      await container.stop();
      logger.info(`Container ${containerId} stopped`);
    } catch (error) {
      logger.error(`Failed to stop container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Restart a container
   */
  async restartContainer(containerId: string): Promise<void> {
    try {
      logger.info(`Restarting container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      await container.restart();
      logger.info(`Container ${containerId} restarted`);
    } catch (error) {
      logger.error(`Failed to restart container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Pause a container
   */
  async pauseContainer(containerId: string): Promise<void> {
    try {
      logger.info(`Pausing container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      await container.pause();
      logger.info(`Container ${containerId} paused`);
    } catch (error) {
      logger.error(`Failed to pause container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unpause a container
   */
  async unpauseContainer(containerId: string): Promise<void> {
    try {
      logger.info(`Unpausing container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      await container.unpause();
      logger.info(`Container ${containerId} unpaused`);
    } catch (error) {
      logger.error(`Failed to unpause container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Kill a container
   */
  async killContainer(containerId: string): Promise<void> {
    try {
      logger.info(`Killing container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      await container.kill();
      logger.info(`Container ${containerId} killed`);
    } catch (error) {
      logger.error(`Failed to kill container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(containerId: string, options: any = {}): Promise<any> {
    try {
      logger.info(`Getting logs for container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      
      const logOptions: Docker.ContainerLogsOptions = {
        stdout: true,
        stderr: true,
        follow: false,
        timestamps: options.timestamps || false,
        tail: options.tail !== undefined ? options.tail.toString() : 'all',
      };
      
      const logs = await container.logs(logOptions);
      return logs.toString();
    } catch (error) {
      logger.error(`Failed to get logs for container ${containerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a network
   */
  async createNetwork(networkConfig: any): Promise<any> {
    try {
      logger.info(`Creating network ${networkConfig.name}`);
      
      // Prepare Docker network configuration
      const dockerNetworkConfig: Docker.NetworkCreateOptions = {
        Name: networkConfig.name,
        Driver: networkConfig.driver || 'bridge',
        Internal: networkConfig.internal || false,
        EnableIPv6: networkConfig.enableIPv6 || false,
        Options: networkConfig.options || {},
        Labels: networkConfig.labels || {},
      };
      
      // Add IPAM config if provided
      if (networkConfig.ipam) {
        dockerNetworkConfig.IPAM = {
          Driver: networkConfig.ipam.driver || 'default',
          Options: networkConfig.ipam.options || {},
          Config: networkConfig.ipam.config || []
        };
      }
      
      // Create the network
      const network = await this.docker.createNetwork(dockerNetworkConfig);
      
      // Inspect the network to get full details
      const networkInfo = await network.inspect();
      
      return {
        id: networkInfo.Id,
        name: networkInfo.Name,
        driver: networkInfo.Driver,
        scope: networkInfo.Scope,
        ipam: networkInfo.IPAM,
        internal: networkInfo.Internal,
        enableIPv6: networkInfo.EnableIPv6,
        options: networkInfo.Options,
        labels: networkInfo.Labels,
        containers: networkInfo.Containers || {},
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error(`Failed to create network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get network by ID
   */
  async getNetwork(networkId: string): Promise<any> {
    try {
      const network = this.docker.getNetwork(networkId);
      const networkInfo = await network.inspect();
      
      return {
        id: networkInfo.Id,
        name: networkInfo.Name,
        driver: networkInfo.Driver,
        scope: networkInfo.Scope,
        ipam: networkInfo.IPAM,
        internal: networkInfo.Internal,
        enableIPv6: networkInfo.EnableIPv6,
        options: networkInfo.Options,
        labels: networkInfo.Labels,
        containers: networkInfo.Containers || {},
      };
    } catch (error) {
      logger.error(`Failed to get network ${networkId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all networks
   */
  async listNetworks(): Promise<any[]> {
    try {
      const networks = await this.docker.listNetworks();
      return Promise.all(networks.map(async (networkInfo) => {
        const network = this.docker.getNetwork(networkInfo.Id);
        const details = await network.inspect();
        
        return {
          id: details.Id,
          name: details.Name,
          driver: details.Driver,
          scope: details.Scope,
          ipam: details.IPAM,
          internal: details.Internal,
          enableIPv6: details.EnableIPv6,
          options: details.Options,
          labels: details.Labels,
          containers: details.Containers || {},
        };
      }));
    } catch (error) {
      logger.error(`Failed to list networks: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove a network
   */
  async removeNetwork(networkId: string): Promise<void> {
    try {
      logger.info(`Removing network ${networkId}`);
      const network = this.docker.getNetwork(networkId);
      await network.remove();
      logger.info(`Network ${networkId} removed`);
    } catch (error) {
      logger.error(`Failed to remove network ${networkId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Connect a container to a network
   */
  async connectContainerToNetwork(networkId: string, containerId: string, options?: any): Promise<void> {
    try {
      logger.info(`Connecting container ${containerId} to network ${networkId}`);
      const network = this.docker.getNetwork(networkId);
      await network.connect({
        Container: containerId,
        EndpointConfig: options || {},
      });
      logger.info(`Container ${containerId} connected to network ${networkId}`);
    } catch (error) {
      logger.error(`Failed to connect container ${containerId} to network ${networkId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Disconnect a container from a network
   */
  async disconnectContainerFromNetwork(networkId: string, containerId: string): Promise<void> {
    try {
      logger.info(`Disconnecting container ${containerId} from network ${networkId}`);
      const network = this.docker.getNetwork(networkId);
      await network.disconnect({
        Container: containerId,
        Force: false,
      });
      logger.info(`Container ${containerId} disconnected from network ${networkId}`);
    } catch (error) {
      logger.error(`Failed to disconnect container ${containerId} from network ${networkId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Create a volume
   */
  async createVolume(volumeConfig: any): Promise<any> {
    try {
      logger.info(`Creating volume ${volumeConfig.name}`);
      
      // Prepare Docker volume configuration
      const dockerVolumeConfig: Docker.VolumeCreateOptions = {
        Name: volumeConfig.name,
        Driver: volumeConfig.driver || 'local',
        DriverOpts: volumeConfig.driver_opts || {},
        Labels: volumeConfig.labels || {},
      };
      
      // Create the volume
      const volumeResponse = await this.docker.createVolume(dockerVolumeConfig);
      
      // Inspect the volume to get full details
      const volumeInfo = await volumeResponse.inspect();
      
      return {
        id: volumeInfo.Name, // Docker uses name as ID for volumes
        name: volumeInfo.Name,
        driver: volumeInfo.Driver,
        mountpoint: volumeInfo.Mountpoint,
        scope: 'local', // Docker volumes are always local
        driver_opts: volumeInfo.Options,
        labels: volumeInfo.Labels,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error(`Failed to create volume: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get volume by name
   */
  async getVolume(volumeName: string): Promise<any> {
    try {
      const volume = this.docker.getVolume(volumeName);
      const volumeInfo = await volume.inspect();
      
      return {
        id: volumeInfo.Name,
        name: volumeInfo.Name,
        driver: volumeInfo.Driver,
        mountpoint: volumeInfo.Mountpoint,
        scope: 'local',
        driver_opts: volumeInfo.Options,
        labels: volumeInfo.Labels,
        usage: {
          size: 0, // Docker API doesn't provide size info directly
          refCount: 0, // Docker API doesn't provide refCount info directly
        },
      };
    } catch (error) {
      logger.error(`Failed to get volume ${volumeName}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * List all volumes
   */
  async listVolumes(): Promise<any[]> {
    try {
      const volumesResponse = await this.docker.listVolumes();
      const volumes = volumesResponse.Volumes || [];
      
      return volumes.map(volumeInfo => ({
        id: volumeInfo.Name,
        name: volumeInfo.Name,
        driver: volumeInfo.Driver,
        mountpoint: volumeInfo.Mountpoint,
        scope: 'local',
        driver_opts: volumeInfo.Options,
        labels: volumeInfo.Labels,
        usage: {
          size: 0, // Docker API doesn't provide size info directly
          refCount: 0, // Docker API doesn't provide refCount info directly
        },
      }));
    } catch (error) {
      logger.error(`Failed to list volumes: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Remove a volume
   */
  async removeVolume(volumeName: string, force = false): Promise<void> {
    try {
      logger.info(`Removing volume ${volumeName}`);
      const volume = this.docker.getVolume(volumeName);
      await volume.remove({ force });
      logger.info(`Volume ${volumeName} removed`);
    } catch (error) {
      logger.error(`Failed to remove volume ${volumeName}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Prune unused volumes
   */
  async pruneVolumes(): Promise<{ count: number }> {
    try {
      logger.info('Pruning unused volumes');
      const pruneResponse = await this.docker.pruneVolumes();
      const volumesDeleted = pruneResponse.VolumesDeleted || [];
      logger.info(`Pruned ${volumesDeleted.length} unused volumes`);
      return { count: volumesDeleted.length };
    } catch (error) {
      logger.error(`Failed to prune volumes: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * List all images
   */
  async listImages(options: any = {}): Promise<any[]> {
    try {
      const images = await this.docker.listImages(options);
      return images.map(image => ({
        id: image.Id.replace('sha256:', ''),
        name: this.extractImageName(image),
        tag: this.extractImageTag(image),
        size: image.Size,
        createdAt: new Date(image.Created * 1000),
        parentId: image.ParentId,
        repoDigests: image.RepoDigests,
        labels: image.Labels || {},
        virtualSize: image.VirtualSize,
      }));
    } catch (error) {
      logger.error(`Failed to list images: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get image by ID
   */
  async getImage(imageId: string): Promise<any> {
    try {
      const image = this.docker.getImage(imageId);
      const imageInfo = await image.inspect();
      
      return {
        id: imageInfo.Id.replace('sha256:', ''),
        name: this.extractImageName(imageInfo),
        tag: this.extractImageTag(imageInfo),
        size: imageInfo.Size,
        createdAt: new Date(imageInfo.Created),
        parentId: imageInfo.Parent,
        repoDigests: imageInfo.RepoDigests,
        labels: imageInfo.Config.Labels || {},
        virtualSize: imageInfo.VirtualSize,
        containers: imageInfo.Containers || [],
      };
    } catch (error) {
      logger.error(`Failed to get image ${imageId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Pull an image
   */
  async pullImage(imageName: string, tag: string = 'latest'): Promise<any> {
    try {
      logger.info(`Pulling image ${imageName}:${tag}`);
      
      // Stream pull progress
      await new Promise((resolve, reject) => {
        this.docker.pull(`${imageName}:${tag}`, {}, (err: any, stream: any) => {
          if (err) {
            logger.error(`Failed to pull image ${imageName}:${tag}: ${err.message}`);
            return reject(err);
          }
          
          // Handle pull progress
          this.docker.modem.followProgress(stream, (err: any, output: any) => {
            if (err) {
              logger.error(`Pull failed for ${imageName}:${tag}: ${err.message}`);
              return reject(err);
            }
            
            logger.info(`Successfully pulled ${imageName}:${tag}`);
            resolve(output);
          }, (event: any) => {
            // Progress event
            if (event.status && event.progress) {
              logger.debug(`Pull progress for ${imageName}:${tag}: ${event.status} ${event.progress}`);
            }
          });
        });
      });
      
      // Get the pulled image
      const images = await this.listImages({
        filters: { reference: [`${imageName}:${tag}`] },
      });
      
      if (images.length === 0) {
        throw new Error(`Failed to find pulled image ${imageName}:${tag}`);
      }
      
      return images[0];
    } catch (error) {
      logger.error(`Failed to pull image ${imageName}:${tag}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Remove an image
   */
  async removeImage(imageId: string, force: boolean = false): Promise<void> {
    try {
      logger.info(`Removing image ${imageId}`);
      const image = this.docker.getImage(imageId);
      await image.remove({ force });
      logger.info(`Image ${imageId} removed`);
    } catch (error) {
      logger.error(`Failed to remove image ${imageId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Build an image from a Dockerfile
   */
  async buildImage(buildContext: string, options: any): Promise<any> {
    try {
      logger.info(`Building image from context ${buildContext}`);
      
      // Prepare stream
      const buildStream = await this.docker.buildImage(buildContext, options);
      
      // Stream build progress
      const result = await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(buildStream, (err: any, output: any) => {
          if (err) {
            logger.error(`Build failed: ${err.message}`);
            return reject(err);
          }
          
          // Find image ID in build output
          let imageId = null;
          for (const event of output) {
            if (event.aux && event.aux.ID) {
              imageId = event.aux.ID;
              break;
            }
          }
          
          if (!imageId) {
            logger.error('Failed to find built image ID in output');
            return reject(new Error('Failed to extract image ID from build output'));
          }
          
          logger.info(`Successfully built image ${imageId}`);
          resolve({ imageId });
        }, (event: any) => {
          // Progress event
          if (event.stream) {
            logger.debug(`Build progress: ${event.stream.trim()}`);
          }
        });
      });
      
      // Get the built image
      return this.getImage((result as any).imageId);
    } catch (error) {
      logger.error(`Failed to build image: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Tag an image with a new name/tag
   */
  async tagImage(imageId: string, repository: string, tag: string): Promise<void> {
    try {
      logger.info(`Tagging image ${imageId} as ${repository}:${tag}`);
      const image = this.docker.getImage(imageId);
      await image.tag({ repo: repository, tag });
      logger.info(`Image ${imageId} tagged as ${repository}:${tag}`);
    } catch (error) {
      logger.error(`Failed to tag image ${imageId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Push an image to a registry
   */
  async pushImage(repository: string, tag: string, authConfig?: any): Promise<void> {
    try {
      logger.info(`Pushing image ${repository}:${tag}`);
      const image = this.docker.getImage(`${repository}:${tag}`);
      
      // Stream push progress
      await new Promise((resolve, reject) => {
        image.push({
          authconfig: authConfig,
        }, (err: any, stream: any) => {
          if (err) {
            logger.error(`Failed to push image ${repository}:${tag}: ${err.message}`);
            return reject(err);
          }
          
          // Handle push progress
          this.docker.modem.followProgress(stream, (err: any, output: any) => {
            if (err) {
              logger.error(`Push failed for ${repository}:${tag}: ${err.message}`);
              return reject(err);
            }
            
            logger.info(`Successfully pushed ${repository}:${tag}`);
            resolve(output);
          }, (event: any) => {
            // Progress event
            if (event.status && event.progress) {
              logger.debug(`Push progress for ${repository}:${tag}: ${event.status} ${event.progress}`);
            }
          });
        });
      });
    } catch (error) {
      logger.error(`Failed to push image ${repository}:${tag}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Prune unused images
   */
  async pruneImages(): Promise<{ count: number; spaceReclaimed: number }> {
    try {
      logger.info('Pruning unused images');
      const pruneResponse = await this.docker.pruneImages();
      const imagesDeleted = pruneResponse.ImagesDeleted || [];
      const spaceReclaimed = pruneResponse.SpaceReclaimed || 0;
      logger.info(`Pruned ${imagesDeleted.length} unused images, reclaimed ${spaceReclaimed} bytes`);
      return { 
        count: imagesDeleted.length,
        spaceReclaimed 
      };
    } catch (error) {
      logger.error(`Failed to prune images: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Extract image name from Docker image info
   */
  private extractImageName(imageInfo: any): string {
    if (!imageInfo.RepoTags || imageInfo.RepoTags.length === 0) {
      return '<none>';
    }
    
    const repoTag = imageInfo.RepoTags[0];
    return repoTag.split(':')[0];
  }
  
  /**
   * Extract image tag from Docker image info
   */
  private extractImageTag(imageInfo: any): string {
    if (!imageInfo.RepoTags || imageInfo.RepoTags.length === 0) {
      return '<none>';
    }
    
    const repoTag = imageInfo.RepoTags[0];
    const parts = repoTag.split(':');
    return parts.length > 1 ? parts[1] : 'latest';
  }

  /**
   * Start container watch jobs
   */
  private startWatchJobs(): void {
    const { cron, watchstats, cronstats } = this.configuration;
    
    // Container watcher job
    if (cron) {
      logger.info(`Starting container watcher cron job with schedule: ${cron}`);
      this.cronJob = new CronJob(cron, () => {
        this.syncContainers().catch(error => {
          logger.error(`Failed to sync containers: ${error.message}`);
        });
      });
      this.cronJob.start();
    }
    
    // Container stats job
    if (watchstats && cronstats) {
      logger.info(`Starting container stats cron job with schedule: ${cronstats}`);
      this.statsJob = new CronJob(cronstats, () => {
        this.syncContainerStats().catch(error => {
          logger.error(`Failed to sync container stats: ${error.message}`);
        });
      });
      this.statsJob.start();
    }
  }

  /**
   * Sync containers with the database
   */
  private async syncContainers(): Promise<void> {
    try {
      logger.info(`Syncing containers for ${this.name}`);
      
      // Get all containers from Docker
      const containers = await this.docker.listContainers({ all: true });
      
      // Get device UUID from configuration
      const { deviceUuid } = this.configuration;
      
      for (const containerInfo of containers) {
        try {
          const container = this.docker.getContainer(containerInfo.Id);
          const details = await container.inspect();
          
          // Format container info
          const formattedContainer = this.formatContainerInfo(details);
          
          // Add to cache
          this.containersCache.set(containerInfo.Id, formattedContainer);
          
          // Check if container exists in database
          const existingContainer = await this.containerService.getContainersByDeviceUuid(deviceUuid)
            .then(containers => containers.find(c => c.id === containerInfo.Id));
          
          if (existingContainer) {
            // Update container in database
            await this.containerService.updateContainer(existingContainer.uuid, {
              ...formattedContainer,
              deviceUuid,
              watchers: [this.name],
            });
          } else {
            // Create container in database
            const containerEntity = {
              ...formattedContainer,
              uuid: uuidv4(),
              deviceUuid,
              watchers: [this.name],
              isManaged: false, // Not managed by us originally
              isWatched: true,
            };
            await this.containerService.createContainer(deviceUuid, containerEntity);
          }
        } catch (error) {
          logger.error(`Failed to sync container ${containerInfo.Id}: ${error.message}`);
        }
      }
      
      logger.info(`Containers synced for ${this.name}`);
    } catch (error) {
      logger.error(`Failed to sync containers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync container stats
   */
  private async syncContainerStats(): Promise<void> {
    try {
      logger.info(`Syncing container stats for ${this.name}`);
      
      // Get all running containers
      const containers = await this.docker.listContainers();
      
      for (const containerInfo of containers) {
        try {
          const container = this.docker.getContainer(containerInfo.Id);
          const stats = await container.stats({ stream: false });
          
          // Find container in cache
          const cachedContainer = this.containersCache.get(containerInfo.Id);
          if (cachedContainer) {
            // Update stats in cache
            cachedContainer.stats = this.formatContainerStats(stats);
            this.containersCache.set(containerInfo.Id, cachedContainer);
            
            // Update stats in database
            const existingContainer = await this.containerService.getContainersByDeviceUuid(this.configuration.deviceUuid)
              .then(containers => containers.find(c => c.id === containerInfo.Id));
            
            if (existingContainer) {
              await this.containerService.updateContainer(existingContainer.uuid, {
                stats: cachedContainer.stats,
              });
            }
          }
        } catch (error) {
          logger.error(`Failed to sync stats for container ${containerInfo.Id}: ${error.message}`);
        }
      }
      
      logger.info(`Container stats synced for ${this.name}`);
    } catch (error) {
      logger.error(`Failed to sync container stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format container info
   */
  private formatContainerInfo(containerInfo: any): any {
    return {
      id: containerInfo.Id,
      name: containerInfo.Name.replace(/^\//, ''), // Remove leading slash
      image: containerInfo.Config.Image,
      command: containerInfo.Config.Cmd ? containerInfo.Config.Cmd.join(' ') : '',
      state: containerInfo.State.Status,
      status: containerInfo.State.Status,
      createdAt: new Date(containerInfo.Created),
      ports: this.formatPorts(containerInfo.NetworkSettings.Ports),
      labels: containerInfo.Config.Labels || {},
      env: containerInfo.Config.Env || [],
      networks: containerInfo.NetworkSettings.Networks || {},
      mounts: containerInfo.Mounts || [],
      restart: containerInfo.HostConfig.RestartPolicy.Name,
      oomKilled: containerInfo.State.OOMKilled,
    };
  }

  /**
   * Format container stats
   */
  private formatContainerStats(stats: any): any {
    // Calculate CPU usage percentage
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent = (cpuDelta / systemCpuDelta) * 100 * stats.cpu_stats.online_cpus;
    
    // Calculate memory usage
    const memoryUsage = stats.memory_stats.usage;
    const memoryLimit = stats.memory_stats.limit;
    const memoryPercent = (memoryUsage / memoryLimit) * 100;
    
    return {
      timestamp: new Date(),
      cpu: {
        usage: cpuPercent.toFixed(2),
        total: stats.cpu_stats.online_cpus,
      },
      memory: {
        usage: memoryUsage,
        limit: memoryLimit,
        percent: memoryPercent.toFixed(2),
      },
      networks: stats.networks,
      blkio: stats.blkio_stats,
    };
  }

  /**
   * Format ports mapping
   */
  private formatPorts(ports: any): any {
    const formattedPorts: any = {};
    
    if (!ports) {
      return formattedPorts;
    }
    
    Object.entries(ports).forEach(([portProto, bindings]: [string, any]) => {
      formattedPorts[portProto] = {
        bindings: bindings || [],
      };
    });
    
    return formattedPorts;
  }

  /**
   * Prepare environment variables
   */
  private prepareEnvironmentVariables(env?: Record<string, string>): string[] {
    if (!env) {
      return [];
    }
    
    return Object.entries(env).map(([key, value]) => `${key}=${value}`);
  }

  /**
   * Prepare port bindings
   */
  private preparePortBindings(ports?: Record<string, any>): any {
    const portBindings: any = {};
    
    if (!ports) {
      return portBindings;
    }
    
    Object.entries(ports).forEach(([portProto, binding]: [string, any]) => {
      portBindings[portProto] = binding.bindings ? binding.bindings.map((b: any) => ({
        HostIp: b.hostIp || '',
        HostPort: b.hostPort || '',
      })) : [];
    });
    
    return portBindings;
  }

  /**
   * Prepare volume bindings
   */
  private prepareVolumeBindings(volumes?: any[]): string[] {
    if (!volumes) {
      return [];
    }
    
    return volumes.map(volume => {
      let binding = `${volume.source}:${volume.target}`;
      if (volume.readonly) {
        binding += ':ro';
      }
      return binding;
    });
  }
}