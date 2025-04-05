import { Kind } from '@modules/containers/domain/components/kind.enum';
import { DeployNetworkDto } from '@modules/containers/presentation/dtos/create-network.dto';
import { IPlaybooksService, PLAYBOOKS_SERVICE, PlaybookService } from '@modules/playbooks';
import { IUser } from '@modules/users/domain/entities/user.entity';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import PinoLogger from '../../../../logger';
import { WATCHERS } from '../../constants';
import { IContainerNetworkEntity } from '../../domain/entities/container-network.entity';
import { IContainerNetworksService } from '../../domain/interfaces/container-networks-service.interface';
import {
  CONTAINER_SERVICE,
  IContainerService,
} from '../../domain/interfaces/container-service.interface';
import {
  IWatcherEngineService,
  WATCHER_ENGINE_SERVICE,
} from '../../domain/interfaces/watcher-engine-service.interface';
import {
  CONTAINER_NETWORK_REPOSITORY,
  IContainerNetworkRepository,
} from '../../domain/repositories/container-network-repository.interface';

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
    private readonly watcherEngineService: IWatcherEngineService,
    private readonly playbookService: PlaybookService,
    @Inject(PLAYBOOKS_SERVICE)
    private readonly playbooksService: IPlaybooksService,
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
  async getNetworkById(id: string): Promise<IContainerNetworkEntity | null> {
    return this.networkRepository.findOneById(id);
  }

  /**
   * Create a new network on a device
   */
  async createNetwork(
    deviceUuid: string,
    networkData: Partial<IContainerNetworkEntity>,
  ): Promise<IContainerNetworkEntity> {
    networkData.deviceUuid = deviceUuid;
    return this.networkRepository.create(networkData);
  }

  async deployNetwork(
    deviceUuid: string,
    networkData: DeployNetworkDto,
    user: IUser,
  ): Promise<string> {
    try {
      logger.info(`Creating network on device ${deviceUuid}`);

      const playbook =
        await this.playbooksService.findOneByUniqueQuickReference('createDockerNetwork');
      if (!playbook) {
        throw new NotFoundException(
          'Playbook with unique quick reference createDockerNetwork not found',
        );
      }
      const createNetworkConfig: API.ExtraVars = [];
      Object.keys(networkData.config).forEach((key) => {
        let value = networkData.config[key];
        if (value) {
          if (typeof value !== 'string') {
            // If value is an object (including arrays), stringify it
            value = JSON.stringify(value);
          }
          createNetworkConfig.push({ extraVar: key, value: value });
        }
      });
      const execId = await this.playbookService.executePlaybook(
        playbook,
        user,
        [networkData.target],
        createNetworkConfig,
      );
      return execId;
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
  async connectContainerToNetwork(networkId: string, containerId: string): Promise<boolean> {
    try {
      logger.info(`Connecting container ${containerId} to network ${networkId}`);

      // Find the network
      const network = await this.networkRepository.findOneById(networkId);
      if (!network) {
        throw new NotFoundException(`Network with ID ${networkId} not found`);
      }

      // Find the container
      const container = await this.containerService.getContainerById(containerId);
      if (!container) {
        throw new NotFoundException(`Container with ID ${containerId} not found`);
      }

      // Verify they are on the same device
      if (network.deviceUuid !== container.deviceUuid) {
        throw new Error('Container and network must be on the same device');
      }

      // Find the Docker watcher component
      const deviceUuid = network.deviceUuid;
      const dockerComponent = this.watcherEngineService.findRegisteredComponent(
        Kind.WATCHER,
        WATCHERS.DOCKER,
        container.watcher,
      );

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
        Name: container.name,
        EndpointID: '', // Would be provided by Docker
        MacAddress: '', // Would be provided by Docker
        IPv4Address: '', // Would be provided by Docker
        IPv6Address: '', // Would be provided by Docker
      };

      await this.networkRepository.update(networkId, {
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
  async disconnectContainerFromNetwork(networkId: string, containerId: string): Promise<boolean> {
    try {
      logger.info(`Disconnecting container ${containerId} from network ${networkId}`);

      // Find the network
      const network = await this.networkRepository.findOneById(networkId);
      if (!network) {
        throw new NotFoundException(`Network with ID ${networkId} not found`);
      }

      // Find the container
      const container = await this.containerService.getContainerById(containerId);
      if (!container) {
        throw new NotFoundException(`Container with ID ${containerId} not found`);
      }

      // Find the Docker watcher component
      const deviceUuid = network.deviceUuid;
      const dockerComponent = this.watcherEngineService.findRegisteredComponent(
        Kind.WATCHER,
        WATCHERS.DOCKER,
        container.watcher,
      );

      if (!dockerComponent) {
        throw new Error(`Docker watcher for device ${deviceUuid} not found`);
      }

      // Disconnect container from network in Docker
      // For simplicity, we're using a method that doesn't exist yet
      await this.disconnectDockerContainerFromNetwork(dockerComponent, network.id, container.id);

      // Update network in database
      if (network.containers && network.containers[container.id]) {
        const { [container.id]: _, ...remainingContainers } = network.containers;
        await this.networkRepository.update(networkId, {
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
