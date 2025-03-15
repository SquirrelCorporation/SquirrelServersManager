import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ContainerNetworksServiceInterface } from '../interfaces/container-networks-service.interface';
import { ContainerNetworkEntity } from '../../domain/entities/container-network.entity';
import { CONTAINER_NETWORK_REPOSITORY } from '../../domain/repositories/container-network-repository.interface';
import { ContainerNetworkRepositoryInterface } from '../../domain/repositories/container-network-repository.interface';
import { WATCHER_ENGINE_SERVICE } from '../interfaces/watcher-engine-service.interface';
import { WatcherEngineServiceInterface } from '../interfaces/watcher-engine-service.interface';
import { CONTAINER_SERVICE } from '../interfaces/container-service.interface';
import { ContainerServiceInterface } from '../interfaces/container-service.interface';
import { DevicesService } from '../../../devices/application/services/devices.service';
import PinoLogger from '../../../../logger';
import { v4 as uuidv4 } from 'uuid';
import { WATCHERS, Kind } from '../../constants';

const logger = PinoLogger.child({ module: 'ContainerNetworksService' }, { msgPrefix: '[CONTAINER_NETWORKS] - ' });

@Injectable()
export class ContainerNetworksService implements ContainerNetworksServiceInterface {
  constructor(
    @Inject(CONTAINER_NETWORK_REPOSITORY)
    private readonly networkRepository: ContainerNetworkRepositoryInterface,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: WatcherEngineServiceInterface,
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: ContainerServiceInterface,
    private readonly devicesService: DevicesService,
  ) {}

  /**
   * Get all container networks
   */
  async getAllNetworks(): Promise<ContainerNetworkEntity[]> {
    return this.networkRepository.findAll();
  }

  /**
   * Get networks by device UUID
   */
  async getNetworksByDeviceUuid(deviceUuid: string): Promise<ContainerNetworkEntity[]> {
    return this.networkRepository.findAllByDeviceUuid(deviceUuid);
  }

  /**
   * Get a network by its UUID
   */
  async getNetworkByUuid(uuid: string): Promise<ContainerNetworkEntity | null> {
    return this.networkRepository.findOneByUuid(uuid);
  }

  /**
   * Create a new network on a device
   */
  async createNetwork(deviceUuid: string, networkData: Partial<ContainerNetworkEntity>): Promise<ContainerNetworkEntity> {
    try {
      logger.info(`Creating network ${networkData.name} on device ${deviceUuid}`);
      
      // Verify device exists
      const device = await this.devicesService.findByUuid(deviceUuid);
      if (!device) {
        throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
      }

      // Check if a network with the same name already exists
      const existingNetwork = await this.networkRepository.findOneByNameAndDeviceUuid(
        networkData.name as string,
        deviceUuid
      );
      
      if (existingNetwork) {
        throw new Error(`Network with name ${networkData.name} already exists on device ${deviceUuid}`);
      }

      // Find the Docker watcher component for this device
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Create network in Docker
      // For simplicity, we're directly using dockerComponent.createNetwork which doesn't exist
      // In a real implementation, you'd extend DockerWatcherComponent with network methods
      // and properly use them here
      const createdNetwork = await this.createDockerNetwork(dockerComponent, networkData);
      
      // Create a network entity with UUID
      const networkEntity: ContainerNetworkEntity = {
        ...createdNetwork,
        uuid: uuidv4(),
        deviceUuid,
      };

      // Save to database
      return this.networkRepository.create(networkEntity);
    } catch (error) {
      logger.error(`Failed to create network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a network
   */
  async updateNetwork(uuid: string, networkData: Partial<ContainerNetworkEntity>): Promise<ContainerNetworkEntity> {
    try {
      // Find the existing network
      const existingNetwork = await this.networkRepository.findOneByUuid(uuid);
      if (!existingNetwork) {
        throw new NotFoundException(`Network with UUID ${uuid} not found`);
      }

      // Networks generally can't be updated in Docker once created
      // We can update our metadata about them though
      return this.networkRepository.update(uuid, networkData);
    } catch (error) {
      logger.error(`Failed to update network ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a network
   */
  async deleteNetwork(uuid: string): Promise<boolean> {
    try {
      logger.info(`Deleting network ${uuid}`);
      
      // Find the existing network
      const existingNetwork = await this.networkRepository.findOneByUuid(uuid);
      if (!existingNetwork) {
        throw new NotFoundException(`Network with UUID ${uuid} not found`);
      }

      // Find the Docker watcher component for this device
      const deviceUuid = existingNetwork.deviceUuid;
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Delete network in Docker
      // For simplicity, we're directly using dockerComponent.removeNetwork which doesn't exist
      // In a real implementation, you'd extend DockerWatcherComponent with network methods
      await this.removeDockerNetwork(dockerComponent, existingNetwork.id);

      // Delete from database
      return this.networkRepository.deleteByUuid(uuid);
    } catch (error) {
      logger.error(`Failed to delete network ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Connect a container to a network
   */
  async connectContainerToNetwork(networkUuid: string, containerUuid: string): Promise<boolean> {
    try {
      logger.info(`Connecting container ${containerUuid} to network ${networkUuid}`);
      
      // Find the network
      const network = await this.networkRepository.findOneByUuid(networkUuid);
      if (!network) {
        throw new NotFoundException(`Network with UUID ${networkUuid} not found`);
      }

      // Find the container
      const container = await this.containerService.getContainerByUuid(containerUuid);
      if (!container) {
        throw new NotFoundException(`Container with UUID ${containerUuid} not found`);
      }

      // Verify they are on the same device
      if (network.deviceUuid !== container.deviceUuid) {
        throw new Error('Container and network must be on the same device');
      }

      // Find the Docker watcher component
      const deviceUuid = network.deviceUuid;
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Connect container to network in Docker
      // For simplicity, we're using a method that doesn't exist yet
      await this.connectDockerContainerToNetwork(dockerComponent, network.id, container.id);

      // Update network in database
      if (!network.containers) {
        network.containers = {};
      }
      
      // Add container to network's container list
      network.containers[container.id] = {
        name: container.name,
        endpointId: '', // Would be provided by Docker
        macAddress: '', // Would be provided by Docker
        ipv4Address: '', // Would be provided by Docker
        ipv6Address: '', // Would be provided by Docker
      };
      
      await this.networkRepository.update(networkUuid, {
        containers: network.containers,
      });

      return true;
    } catch (error) {
      logger.error(`Failed to connect container to network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Disconnect a container from a network
   */
  async disconnectContainerFromNetwork(networkUuid: string, containerUuid: string): Promise<boolean> {
    try {
      logger.info(`Disconnecting container ${containerUuid} from network ${networkUuid}`);
      
      // Find the network
      const network = await this.networkRepository.findOneByUuid(networkUuid);
      if (!network) {
        throw new NotFoundException(`Network with UUID ${networkUuid} not found`);
      }

      // Find the container
      const container = await this.containerService.getContainerByUuid(containerUuid);
      if (!container) {
        throw new NotFoundException(`Container with UUID ${containerUuid} not found`);
      }

      // Find the Docker watcher component
      const deviceUuid = network.deviceUuid;
      const watcherName = `${WATCHERS.DOCKER}-${deviceUuid}`;
      const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
      
      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Disconnect container from network in Docker
      // For simplicity, we're using a method that doesn't exist yet
      await this.disconnectDockerContainerFromNetwork(dockerComponent, network.id, container.id);

      // Update network in database
      if (network.containers && network.containers[container.id]) {
        const { [container.id]: _, ...remainingContainers } = network.containers;
        await this.networkRepository.update(networkUuid, {
          containers: remainingContainers,
        });
      }

      return true;
    } catch (error) {
      logger.error(`Failed to disconnect container from network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to create a Docker network
   */
  private async createDockerNetwork(dockerComponent: any, networkData: Partial<ContainerNetworkEntity>): Promise<any> {
    try {
      return dockerComponent.createNetwork(networkData);
    } catch (error) {
      logger.error(`Failed to create Docker network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to remove a Docker network
   */
  private async removeDockerNetwork(dockerComponent: any, networkId: string): Promise<void> {
    try {
      await dockerComponent.removeNetwork(networkId);
    } catch (error) {
      logger.error(`Failed to remove Docker network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to connect a Docker container to a network
   */
  private async connectDockerContainerToNetwork(dockerComponent: any, networkId: string, containerId: string): Promise<void> {
    try {
      await dockerComponent.connectContainerToNetwork(networkId, containerId);
    } catch (error) {
      logger.error(`Failed to connect container to network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to disconnect a Docker container from a network
   */
  private async disconnectDockerContainerFromNetwork(dockerComponent: any, networkId: string, containerId: string): Promise<void> {
    try {
      await dockerComponent.disconnectContainerFromNetwork(networkId, containerId);
    } catch (error) {
      logger.error(`Failed to disconnect container from network: ${error.message}`);
      throw error;
    }
  }
}