import { getCustomAgent } from '@infrastructure/adapters/ssh';
import { SSHCredentialsAdapter } from '@infrastructure/adapters/ssh/ssh-credentials.adapter';
import { WATCHERS } from '@modules/containers/application/services/components/core/constants';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { Kind } from '@modules/containers/domain/components/kind.enum';
import { IWatcherComponent } from '@modules/containers/domain/components/watcher.interface';
import { fullName } from '@modules/containers/utils/utils';
import { DEVICES_SERVICE, IDevice, IDeviceAuth, IDevicesService } from '@modules/devices';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import DockerModem from 'docker-modem';
import Dockerode from 'dockerode';
import logger from 'src/logger';
import { SsmContainer, SsmStatus } from 'ssm-shared-lib';
import { GetContainersPayloadDto } from '@modules/mcp/application/dto/get-containers.payload.dto';
import { VAULT_CRYPTO_SERVICE } from '@modules/ansible-vaults';
import { IVaultCryptoService } from '@modules/ansible-vaults/domain/interfaces/vault-crypto-service.interface';
import { DEFAULT_VAULT_ID } from '@modules/ansible-vaults';
import { PreCheckDockerConnectionDto } from '@modules/containers/presentation/dtos/pre-check-docker-connection.dto';
import {
  DEVICE_AUTH_SERVICE,
  IDeviceAuthService,
} from '../../../devices/domain/services/device-auth-service.interface';
import { IContainer } from '../../domain/entities/container.entity';
import { IContainerService } from '../../domain/interfaces/container-service.interface';
import {
  IWatcherEngineService,
  WATCHER_ENGINE_SERVICE,
} from '../../domain/interfaces/watcher-engine-service.interface';
import {
  CONTAINER_REPOSITORY,
  IContainerRepository,
} from '../../domain/repositories/container-repository.interface';

@Injectable()
export class ContainerService implements IContainerService {
  private readonly logger = new Logger(ContainerService.name);
  constructor(
    @Inject(CONTAINER_REPOSITORY)
    private readonly containerRepository: IContainerRepository,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: IWatcherEngineService,
    @Inject(DEVICES_SERVICE)
    private readonly devicesService: IDevicesService,
    @Inject(DEVICE_AUTH_SERVICE)
    private readonly deviceAuthService: IDeviceAuthService,
    @Inject(VAULT_CRYPTO_SERVICE)
    private readonly vaultCryptoService: IVaultCryptoService,
  ) {}

  async getAllContainers(): Promise<IContainer[]> {
    return this.containerRepository.findAll();
  }

  async getContainerById(id: string): Promise<IContainer> {
    this.logger.log(`Service: Getting container by ID: ${id}`);
    if (!id) {
      this.logger.warn('Service: Missing containerId in getContainerById call');
      throw new NotFoundException('Missing containerId');
    }
    try {
      const container = await this.containerRepository.findOneById(id);
      if (!container) {
        this.logger.warn(`Service: Container with ID ${id} not found in repository.`);
        throw new NotFoundException(`Container with ID ${id} not found`);
      }
      return container;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Service: Caught NotFoundException for container ID ${id}.`);
        throw error;
      }
      this.logger.error(
        `Service: Error getting container by ID ${id}: ${error}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getContainersByDeviceUuid(deviceUuid: string): Promise<IContainer[]> {
    return this.containerRepository.findAllByDeviceUuid(deviceUuid);
  }

  async countContainers(): Promise<number> {
    return this.containerRepository.count();
  }

  async countContainersByStatus(status: string): Promise<number> {
    return this.containerRepository.countByStatus(status);
  }

  async countByDeviceUuid(deviceUuid: string): Promise<number> {
    return this.containerRepository.countByDeviceUuid(deviceUuid);
  }

  async createContainer(deviceUuid: string, containerData: IContainer): Promise<IContainer> {
    const device = await this.devicesService.findOneByUuid(deviceUuid);
    if (!device) {
      throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
    }
    containerData.deviceUuid = deviceUuid;
    return this.containerRepository.create(containerData);
  }

  async updateContainer(id: string, containerData: Partial<IContainer>): Promise<IContainer> {
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }
    // Update in database
    return this.containerRepository.update(id, containerData);
  }

  normalizeContainer(container: IContainer) {
    const containerWithNormalizedImage = container;
    this.logger.log(`[UTILS] - normalizeContainer - for name: ${container.image?.name}`);
    const registryProvider = Object.values(this.watcherEngineService.getRegistries()).find(
      (provider) => (provider as AbstractRegistryComponent).match(container.image),
    ) as AbstractRegistryComponent;
    if (!registryProvider) {
      this.logger.warn(`${fullName(container)} - No Registry Provider found`);
      containerWithNormalizedImage.image.registry.name = 'unknown';
    } else {
      this.logger.log('Registry found! ' + registryProvider.getId());
      containerWithNormalizedImage.image = registryProvider.normalizeImage(container.image);
    }
    return containerWithNormalizedImage;
  }

  async deleteContainer(id: string): Promise<boolean> {
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    // Find Docker watcher component for this container's watcher
    const dockerComponent = this.watcherEngineService.findRegisteredComponent(
      Kind.WATCHER,
      WATCHERS.DOCKER,
      container.watcher,
    ) as IWatcherComponent;

    if (!dockerComponent) {
      throw new Error(`Docker watcher component for watcher ${container.watcher} not found`);
    }

    try {
      // Use Docker component to delete container - Pass full container object
      await dockerComponent.removeContainer(container);

      // Delete from database
      return this.containerRepository.deleteById(id);
    } catch (error: any) {
      this.logger.error(`Failed to delete container ${id}: ${error.message}`);
      throw error;
    }
  }

  // Helper method to execute container actions (start, stop, etc.)
  public async executeContainerAction(id: string, action: SsmContainer.Actions): Promise<boolean> {
    this.logger.log(`[CONTAINER] - executeContainerAction - for id: ${id} and action: ${action}`);
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      throw new NotFoundException(`Container with id ${id} not found`);
    }

    const registeredComponent = this.watcherEngineService.findRegisteredComponent(
      Kind.WATCHER,
      WATCHERS.DOCKER,
      container.watcher,
    ) as IWatcherComponent;

    if (!registeredComponent) {
      this.logger.error(`Registered watcher for device ${container.deviceUuid} not found`);
      throw new Error(`Registered watcher for device ${container.deviceUuid} not found`);
    }

    this.logger.log(
      `[CONTAINER] - executeContainerAction - for registeredComponent: ${registeredComponent?.getId()}`,
    );

    try {
      this.logger.log(`[CONTAINER] - executeContainerAction - for action: ${action}`);
      switch (action) {
        case SsmContainer.Actions.START:
          await registeredComponent.startContainer(container);
          break;
        case SsmContainer.Actions.STOP:
          await registeredComponent.stopContainer(container);
          break;
        case SsmContainer.Actions.KILL:
          await registeredComponent.killContainer(container);
          break;
        case SsmContainer.Actions.PAUSE:
          await registeredComponent.pauseContainer(container);
          break;
        case SsmContainer.Actions.RESTART:
          await registeredComponent.restartContainer(container);
          break;
        default:
          this.logger.error(`Invalid action: ${action}`);
          throw new Error(`Invalid action: ${action}`);
      }

      return true;
    } catch (error: any) {
      this.logger.error(error, `Failed to ${action} container: ${error.message}`);
      throw error;
    }
  }

  async deleteContainerById(id: string): Promise<boolean> {
    return await this.containerRepository.deleteById(id);
  }

  async getDeviceByUuid(uuid: string): Promise<IDevice | null> {
    return await this.devicesService.findOneByUuid(uuid);
  }

  async getDeviceAuth(deviceUuid: string): Promise<IDeviceAuth | null> {
    const res = await this.deviceAuthService.findDeviceAuthByDeviceUuid(deviceUuid);
    return res?.[0] || null;
  }

  async getDockerSshConnectionOptions(device: IDevice, deviceAuth: IDeviceAuth): Promise<any> {
    const sshHelper = new SSHCredentialsAdapter();
    return await sshHelper.getDockerSshConnectionOptions(device, deviceAuth);
  }

  async updateDeviceDockerInfo(
    deviceUuid: string,
    dockerId: string,
    version: string,
  ): Promise<void> {
    const device = await this.devicesService.findOneByUuid(deviceUuid);
    if (!device) {
      throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
    }
    device.updatedAt = new Date();
    device.dockerId = dockerId;
    device.dockerVersion = version;
    await this.devicesService.update(device);
  }

  async getContainerByUuid(uuid: string): Promise<IContainer | null> {
    return await this.containerRepository.findOneById(uuid);
  }

  async getRegistryByName(name: string): Promise<AbstractRegistryComponent | null> {
    return (
      (this.watcherEngineService
        .getRegistries()
        .find((registry) => registry.getId() === name) as AbstractRegistryComponent) || null
    );
  }

  async getContainersByWatcher(watcherName: string): Promise<IContainer[]> {
    return await this.containerRepository.findAllByWatcher(watcherName);
  }

  async updateContainerStatusByWatcher(watcherName: string, status: string): Promise<void> {
    return await this.containerRepository.updateStatusByWatcher(watcherName, status);
  }

  async checkDockerConnection(deviceUuid: string) {
    const device = await this.devicesService.findOneByUuid(deviceUuid);
    if (!device) {
      throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
    }
    const deviceAuth = await this.getDeviceAuth(deviceUuid);
    if (!deviceAuth) {
      throw new NotFoundException(`Device auth with UUID ${deviceUuid} not found`);
    }
    try {
      const options = await this.getDockerSshConnectionOptions(device, deviceAuth);
      const agent = getCustomAgent(logger, {
        debug: (message: any) => {
          this.logger.debug(message);
        },
        ...options.sshOptions,
        timeout: 60000,
      });
      try {
        options.modem = new DockerModem({
          agent: agent,
        });
      } catch (error: any) {
        this.logger.error(error);
        throw new Error(error.message);
      }
      const docker = new Dockerode({ ...options, timeout: 60000 });
      await docker.ping();
      await docker.info();
      return {
        connectionStatus: 'successful',
      };
    } catch (error: any) {
      return {
        connectionStatus: 'failed',
        errorMessage: error.message,
      };
    }
  }

  async preCheckDockerConnection(preCheckDto: PreCheckDockerConnectionDto) {
    const { ip, authType, sshKey, sshUser, sshPwd, sshPort, becomeMethod, becomePass, sshKeyPass } =
      preCheckDto;
    try {
      const mockedDeviceAuth = {
        device: {
          _id: 'tmp',
          ip,
          uuid: 'tmp',
          status: SsmStatus.DeviceStatus.REGISTERING,
          capabilities: { containers: {} },
          systemInformation: {},
          configuration: { containers: {}, systemInformation: {} },
        },
        authType,
        sshKey: sshKey
          ? await this.vaultCryptoService.encrypt(sshKey, DEFAULT_VAULT_ID)
          : undefined,
        sshUser,
        sshPwd: sshPwd
          ? await this.vaultCryptoService.encrypt(sshPwd, DEFAULT_VAULT_ID)
          : undefined,
        sshPort: sshPort || 22,
        becomeMethod,
        becomePass: becomePass
          ? await this.vaultCryptoService.encrypt(becomePass, DEFAULT_VAULT_ID)
          : undefined,
        sshKeyPass: sshKeyPass
          ? await this.vaultCryptoService.encrypt(sshKeyPass, DEFAULT_VAULT_ID)
          : undefined,
      };
      const options = await this.getDockerSshConnectionOptions(
        mockedDeviceAuth.device,
        mockedDeviceAuth,
      );
      const agent = getCustomAgent(logger, {
        debug: (message: any) => {
          this.logger.debug(message);
        },
        ...options.sshOptions,
        timeout: 60000,
      });
      try {
        options.modem = new DockerModem({
          agent: agent,
        });
      } catch (error: any) {
        this.logger.error(error);
        throw new Error(error.message);
      }
      const docker = new Dockerode({ ...options, timeout: 60000 });
      await docker.ping();
      await docker.info();
      return {
        status: 'successful',
      };
    } catch (error: any) {
      return {
        status: 'failed',
        message: error.message,
      };
    }
  }
  async updateContainerName(id: string, customName: string): Promise<IContainer> {
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      throw new NotFoundException(`Container with id ${id} not found`);
    }
    container.name = customName;
    return await this.containerRepository.update(id, container);
  }

  async refreshAllContainers() {
    await Promise.all(
      Object.values(this.watcherEngineService.getStates().watcher).map((watcher) =>
        watcher.watch(),
      ),
    );
  }

  async getAllContainersFiltered(payload: GetContainersPayloadDto): Promise<IContainer[]> {
    this.logger.log(
      `Service: Getting all containers (filtered - placeholder): ${JSON.stringify(payload)}`,
    );
    try {
      const containers = await this.getAllContainers();
      // TODO: Add filtering logic based on payload if required
      return containers;
    } catch (error) {
      this.logger.error(
        `Service: Error handling getAllContainersFiltered: ${error}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
