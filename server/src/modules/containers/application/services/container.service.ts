import { getCustomAgent } from '@infrastructure/adapters/ssh';
import { SSHCredentialsAdapter } from '@infrastructure/adapters/ssh/ssh-credentials.adapter';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { fullName } from '@modules/containers/utils/utils';
import { DEVICES_SERVICE, IDevice, IDeviceAuth, IDevicesService } from '@modules/devices';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import DockerModem from 'docker-modem';
import Dockerode from 'dockerode';
import logger from 'src/logger';
import {
  DEVICE_AUTH_SERVICE,
  IDeviceAuthService,
} from '../../../devices/domain/services/device-auth-service.interface';
import { IContainerEntity } from '../../domain/entities/container.entity';
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
  ) {}

  async getAllContainers(): Promise<IContainerEntity[]> {
    return this.containerRepository.findAll();
  }

  async getContainerById(id: string): Promise<IContainerEntity | null> {
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      return null;
    }
    return container;
  }

  async getContainersByDeviceUuid(deviceUuid: string): Promise<IContainerEntity[]> {
    return this.containerRepository.findAllByDeviceUuid(deviceUuid);
  }

  async findContainerById(id: string): Promise<IContainerEntity | null> {
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      return null;
    }
    return container;
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

  async createContainer(
    deviceUuid: string,
    containerData: IContainerEntity,
  ): Promise<IContainerEntity> {
    const device = await this.devicesService.findOneByUuid(deviceUuid);
    if (!device) {
      throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
    }
    containerData.deviceUuid = deviceUuid;
    return this.containerRepository.create(containerData);
  }

  async updateContainer(
    id: string,
    containerData: Partial<IContainerEntity>,
  ): Promise<IContainerEntity> {
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }
    // Update in database
    return this.containerRepository.update(id, containerData);
  }

  normalizeContainer(container: IContainerEntity) {
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

    // Find Docker watcher component for this device
    const deviceUuid = container.deviceUuid;
    const watcherName = `docker-${deviceUuid}`;
    const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);

    if (!dockerComponent) {
      throw new Error(`Docker watcher for device ${deviceUuid} not found`);
    }

    try {
      // Use Docker component to delete container
      await dockerComponent.removeContainer(container.id);

      // Delete from database
      return this.containerRepository.deleteById(id);
    } catch (error: any) {
      this.logger.error(`Failed to delete container: ${error.message}`);
      throw error;
    }
  }

  async startContainer(id: string): Promise<boolean> {
    return this.executeContainerAction(id, 'start');
  }

  async stopContainer(id: string): Promise<boolean> {
    return this.executeContainerAction(id, 'stop');
  }

  async restartContainer(id: string): Promise<boolean> {
    return this.executeContainerAction(id, 'restart');
  }

  async pauseContainer(id: string): Promise<boolean> {
    return this.executeContainerAction(id, 'pause');
  }

  async unpauseContainer(id: string): Promise<boolean> {
    return this.executeContainerAction(id, 'unpause');
  }

  async killContainer(id: string): Promise<boolean> {
    return this.executeContainerAction(id, 'kill');
  }

  // Helper method to execute container actions (start, stop, etc.)
  public async executeContainerAction(id: string, action: string): Promise<boolean> {
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      throw new NotFoundException(`Container with id ${id} not found`);
    }

    // Find Docker watcher component for this device
    const deviceUuid = container.deviceUuid;
    const watcherName = `docker-${deviceUuid}`;
    const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);

    if (!dockerComponent) {
      throw new Error(`Docker watcher for device ${deviceUuid} not found`);
    }

    try {
      // Update container state if needed based on action
      let newState: string | undefined;
      switch (action) {
        case 'start':
          await dockerComponent.startContainer(container.id);
          newState = 'running';
          break;
        case 'stop':
          await dockerComponent.stopContainer(container.id);
          newState = 'stopped';
          break;
        case 'kill':
          await dockerComponent.killContainer(container.id);
          newState = 'stopped';
          break;
        case 'pause':
          await dockerComponent.pauseContainer(container.id);
          newState = 'paused';
          break;
        case 'unpause':
          await dockerComponent.unpauseContainer(container.id);
          newState = 'running';
          break;
        case 'restart':
          await dockerComponent.restartContainer(container.id);
          newState = 'running';
          break;
        default:
          throw new Error(`Invalid action: ${action}`);
      }

      if (newState) {
        await this.containerRepository.update(id, { status: newState });
      }

      return true;
    } catch (error: any) {
      this.logger.error(`Failed to ${action} container: ${error.message}`);
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

  async getContainerByUuid(uuid: string): Promise<IContainerEntity | null> {
    return await this.containerRepository.findOneById(uuid);
  }

  async getRegistryByName(name: string): Promise<AbstractRegistryComponent | null> {
    return (
      (this.watcherEngineService
        .getRegistries()
        .find((registry) => registry.getId() === name) as AbstractRegistryComponent) || null
    );
  }

  async getContainersByWatcher(watcherName: string): Promise<IContainerEntity[]> {
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
}
