import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ContainerServiceInterface } from '../interfaces/container-service.interface';
import { ContainerEntity } from '../../domain/entities/container.entity';
import { CONTAINER_REPOSITORY } from '../../domain/repositories/container-repository.interface';
import { SSMServicesTypes } from '../../../../types/typings.d';
import { WatcherEngineServiceInterface } from '../interfaces/watcher-engine-service.interface';
import { WATCHER_ENGINE_SERVICE } from '../interfaces/watcher-engine-service.interface';
import { DevicesService } from '../../../devices/application/services/devices.service';
import PinoLogger from '../../../../logger';
import { ContainerRepositoryInterface } from '../../domain/repositories/container-repository.interface';

const logger = PinoLogger.child({ module: 'ContainerService' }, { msgPrefix: '[CONTAINER_SERVICE] - ' });

@Injectable()
export class ContainerService implements ContainerServiceInterface {
  constructor(
    @Inject(CONTAINER_REPOSITORY)
    private readonly containerRepository: ContainerRepositoryInterface,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: WatcherEngineServiceInterface,
    private readonly devicesService: DevicesService,
  ) {}

  async getAllContainers(): Promise<ContainerEntity[]> {
    return this.containerRepository.findAll();
  }

  async getContainerByUuid(uuid: string): Promise<ContainerEntity | null> {
    const container = await this.containerRepository.findOneByUuid(uuid);
    if (!container) {
      return null;
    }
    return container;
  }

  async getContainersByDeviceUuid(deviceUuid: string): Promise<ContainerEntity[]> {
    return this.containerRepository.findAllByDeviceUuid(deviceUuid);
  }
  
  async findContainerById(id: string): Promise<ContainerEntity | null> {
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
    containerData: SSMServicesTypes.CreateContainerParams
  ): Promise<ContainerEntity> {
    const device = await this.devicesService.findByUuid(deviceUuid);
    if (!device) {
      throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
    }

    // Find Docker watcher component for this device
    const watcherName = `docker-${deviceUuid}`;
    const dockerComponent = this.watcherEngineService.findRegisteredDockerComponent(watcherName);
    
    if (!dockerComponent) {
      throw new Error(`Docker watcher for device ${deviceUuid} not found`);
    }

    try {
      // Use Docker component to create container
      const createdContainer = await dockerComponent.createContainer(containerData);
      
      // Save container to database
      const containerEntity: ContainerEntity = {
        id: createdContainer.id,
        uuid: createdContainer.uuid || createdContainer.Id,
        name: containerData.name,
        deviceUuid,
        image: containerData.image,
        state: createdContainer.state,
        status: createdContainer.status,
        watchers: [watcherName],
        isManaged: true,
        isWatched: true,
      };

      return this.containerRepository.create(containerEntity);
    } catch (error) {
      logger.error(`Failed to create container: ${error.message}`);
      throw error;
    }
  }

  async updateContainer(
    uuid: string,
    containerData: Partial<ContainerEntity>
  ): Promise<ContainerEntity> {
    const container = await this.containerRepository.findOneByUuid(uuid);
    if (!container) {
      throw new NotFoundException(`Container with UUID ${uuid} not found`);
    }

    // Update in database
    return this.containerRepository.update(uuid, containerData);
  }

  async deleteContainer(uuid: string): Promise<boolean> {
    const container = await this.containerRepository.findOneByUuid(uuid);
    if (!container) {
      throw new NotFoundException(`Container with UUID ${uuid} not found`);
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
      return this.containerRepository.deleteByUuid(uuid);
    } catch (error) {
      logger.error(`Failed to delete container: ${error.message}`);
      throw error;
    }
  }

  async startContainer(uuid: string): Promise<boolean> {
    return this.executeContainerAction(uuid, 'start');
  }

  async stopContainer(uuid: string): Promise<boolean> {
    return this.executeContainerAction(uuid, 'stop');
  }

  async restartContainer(uuid: string): Promise<boolean> {
    return this.executeContainerAction(uuid, 'restart');
  }

  async pauseContainer(uuid: string): Promise<boolean> {
    return this.executeContainerAction(uuid, 'pause');
  }

  async unpauseContainer(uuid: string): Promise<boolean> {
    return this.executeContainerAction(uuid, 'unpause');
  }

  async killContainer(uuid: string): Promise<boolean> {
    return this.executeContainerAction(uuid, 'kill');
  }

  async getContainerLogs(uuid: string, options?: any): Promise<any> {
    const container = await this.containerRepository.findOneByUuid(uuid);
    if (!container) {
      throw new NotFoundException(`Container with UUID ${uuid} not found`);
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
    } catch (error) {
      logger.error(`Failed to get container logs: ${error.message}`);
      throw error;
    }
  }

  // Helper method to execute container actions (start, stop, etc.)
  private async executeContainerAction(uuid: string, action: string): Promise<boolean> {
    const container = await this.containerRepository.findOneByUuid(uuid);
    if (!container) {
      throw new NotFoundException(`Container with UUID ${uuid} not found`);
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
        await this.containerRepository.update(uuid, { state: newState });
      }

      return true;
    } catch (error) {
      logger.error(`Failed to ${action} container: ${error.message}`);
      throw error;
    }
  }
}