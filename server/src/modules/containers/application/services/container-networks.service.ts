import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { NetworkInspectInfo } from 'dockerode';
import { IContainerNetworksService } from '../interfaces/container-networks-service.interface';
import { IContainerNetworkEntity } from '../../domain/entities/container-network.entity';
import { CONTAINER_NETWORK_REPOSITORY } from '../../domain/repositories/container-network-repository.interface';
import { IContainerNetworkRepository } from '../../domain/repositories/container-network-repository.interface';
import { CONTAINER_SERVICE } from '../interfaces/container-service.interface';
import { IContainerService } from '../interfaces/container-service.interface';
import {
  IContainerWatcherEngineService,
  WATCHER_ENGINE_SERVICE,
} from '../interfaces/watcher-engine-service.interface';
import { WATCHERS } from '../../constants';
import { Kind } from '../../domain/components/kind.enum';
import { DevicesService } from '../../../devices/application/services/devices.service';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child(
  { module: 'ContainerNetworksService' },
  { msgPrefix: '[CONTAINER_NETWORKS] - ' },
);

@Injectable()
export class ContainerNetworksService implements IContainerNetworksService {
  private readonly logger = new Logger(ContainerNetworksService.name);

  constructor(
    @Inject(CONTAINER_NETWORK_REPOSITORY)
    private readonly networkRepository: IContainerNetworkRepository,
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: IContainerWatcherEngineService,
    private readonly devicesService: DevicesService,
  ) {}

  /**
   * Get all container networks
   */
  async getAllNetworks(): Promise<IContainerNetworkEntity[]> {
    return this.networkRepository.findAll();
  }

  /**
   * Get networks by device UUID
   */
  async getNetworksByDeviceUuid(deviceUuid: string): Promise<IContainerNetworkEntity[]> {
    return this.networkRepository.findAllByDeviceUuid(deviceUuid);
  }

  /**
   * Get a network by its UUID
   */
  async getNetworkByUuid(uuid: string): Promise<IContainerNetworkEntity | null> {
    return this.networkRepository.findOneById(uuid);
  }

  /**
   * Create a new network on a device
   */
  async createNetwork(
    deviceUuid: string,
    networkData: Partial<IContainerNetworkEntity>,
  ): Promise<IContainerNetworkEntity> {
    try {
      logger.info(`Creating network ${networkData.name} on device ${deviceUuid}`);

      // Create a network entity with UUID
      const networkEntity: IContainerNetworkEntity = {
        ...networkData,
        deviceUuid,
      };

      // Save to database
      return this.networkRepository.create(networkEntity);
    } catch (error: any) {
      logger.error(`Failed to create network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a network
   */
  async updateNetwork(
    uuid: string,
    networkData: Partial<IContainerNetworkEntity>,
  ): Promise<IContainerNetworkEntity> {
    try {
      // Find the existing network
      const existingNetwork = await this.networkRepository.findOneById(uuid);
      if (!existingNetwork) {
        throw new NotFoundException(`Network with UUID ${uuid} not found`);
      }

      // Networks generally can't be updated in Docker once created
      // We can update our metadata about them though
      return this.networkRepository.update(uuid, networkData);
    } catch (error: any) {
      logger.error(`Failed to update network ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a network
   */
  async deleteNetwork(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting network ${id}`);

      // Find the existing network
      const existingNetwork = await this.networkRepository.findOneById(id);
      if (!existingNetwork) {
        throw new NotFoundException(`Network with id ${id} not found`);
      }
      // Delete from database
      return this.networkRepository.deleteById(id);
    } catch (error: any) {
      logger.error(`Failed to delete network ${id}: ${error.message}`);
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
    } catch (error: any) {
      logger.error(`Failed to connect container to network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Disconnect a container from a network
   */
  async disconnectContainerFromNetwork(
    networkUuid: string,
    containerUuid: string,
  ): Promise<boolean> {
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
    } catch (error: any) {
      logger.error(`Failed to disconnect container from network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to create a Docker network
   */
  private async createDockerNetwork(
    dockerComponent: any,
    networkData: Partial<IContainerNetworkEntity>,
  ): Promise<any> {
    try {
      return dockerComponent.createNetwork(networkData);
    } catch (error: any) {
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
    } catch (error: any) {
      logger.error(`Failed to remove Docker network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to connect a Docker container to a network
   */
  private async connectDockerContainerToNetwork(
    dockerComponent: any,
    networkId: string,
    containerId: string,
  ): Promise<void> {
    try {
      await dockerComponent.connectContainerToNetwork(networkId, containerId);
    } catch (error: any) {
      logger.error(`Failed to connect container to network: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to disconnect a Docker container from a network
   */
  private async disconnectDockerContainerFromNetwork(
    dockerComponent: any,
    networkId: string,
    containerId: string,
  ): Promise<void> {
    try {
      await dockerComponent.disconnectContainerFromNetwork(networkId, containerId);
    } catch (error: any) {
      logger.error(`Failed to disconnect container from network: ${error.message}`);
      throw error;
    }
  }
}
