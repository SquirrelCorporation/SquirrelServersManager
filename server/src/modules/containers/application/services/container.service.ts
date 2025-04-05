import { WATCHERS } from '@modules/containers/application/services/components/core/constants';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { Kind } from '@modules/containers/domain/components/kind.enum';
import { IWatcherComponent } from '@modules/containers/domain/components/watcher.interface';
import { fullName } from '@modules/containers/utils/utils';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SsmContainer } from 'ssm-shared-lib';
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
    const dockerComponent = this.watcherEngineService.findRegisteredComponent(
      Kind.WATCHER,
      WATCHERS.DOCKER,
      container.watcher,
    );

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

  async updateContainerName(id: string, customName: string): Promise<IContainerEntity> {
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      throw new NotFoundException(`Container with id ${id} not found`);
    }
    container.name = customName;
    return await this.containerRepository.update(id, container);
  }
}
