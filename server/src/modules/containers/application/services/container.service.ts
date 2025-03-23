import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { fullName } from '@modules/containers/utils/utils';
import SSHCredentialsHelper from 'src/helpers/ssh/SSHCredentialsHelper';
import { IDevice, IDeviceAuth } from '@modules/devices';
import {
  IContainerWatcherEngineService,
  WATCHER_ENGINE_SERVICE,
} from '../interfaces/watcher-engine-service.interface';
import { IContainerService } from '../interfaces/container-service.interface';
import { IContainerEntity } from '../../domain/entities/container.entity';
import { CONTAINER_REPOSITORY } from '../../domain/repositories/container-repository.interface';
import { IContainerRepository } from '../../domain/repositories/container-repository.interface';
import { DevicesService } from '../../../devices/application/services/devices.service';

@Injectable()
export class ContainerService implements IContainerService {
  private readonly logger = new Logger(ContainerService.name);
  constructor(
    @Inject(CONTAINER_REPOSITORY)
    private readonly containerRepository: IContainerRepository,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: IContainerWatcherEngineService,
    private readonly devicesService: DevicesService,
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
      (provider) => provider.match(container.image),
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

  async getContainerLogs(id: string, options?: any): Promise<any> {
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
      // Use Docker component to get logs
      return dockerComponent.getContainerLogs(container.id, options);
    } catch (error: any) {
      this.logger.error(`Failed to get container logs: ${error.message}`);
      throw error;
    }
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
      // Use Docker component to execute action
      await dockerComponent[`${action}Container`](container.id);

      // Update container state if needed based on action
      let newState: string | undefined;
      switch (action) {
        case 'start':
          newState = 'running';
          break;
        case 'stop':
        case 'kill':
          newState = 'stopped';
          break;
        case 'pause':
          newState = 'paused';
          break;
        case 'unpause':
          newState = 'running';
          break;
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
    const res = await this.devicesService.findDeviceAuthByDeviceUuid(deviceUuid);
    return res?.[0] || null;
  }

  async getDockerSshConnectionOptions(device: IDevice, deviceAuth: IDeviceAuth): Promise<any> {
    return await SSHCredentialsHelper.getDockerSshConnectionOptions(device, deviceAuth);
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
      this.watcherEngineService.getRegistries().find((registry) => registry.getId() === name) ||
      null
    );
  }

  async getContainersByWatcher(watcherName: string): Promise<IContainerEntity[]> {
    return await this.containerRepository.findAllByWatcher(watcherName);
  }

  async updateContainerStatusByWatcher(watcherName: string, status: string): Promise<void> {
    return await this.containerRepository.updateStatusByWatcher(watcherName, status);
  }
}
