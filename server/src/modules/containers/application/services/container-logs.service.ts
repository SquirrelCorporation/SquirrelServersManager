import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONTAINER_REPOSITORY } from '../../domain/repositories/container-repository.interface';
import { ContainerRepositoryInterface } from '../../domain/repositories/container-repository.interface';
import { WATCHER_ENGINE_SERVICE } from '../interfaces/watcher-engine-service.interface';
import { WatcherEngineServiceInterface } from '../interfaces/watcher-engine-service.interface';
import PinoLogger from '../../../../logger';
import { ContainerEntity } from '../../domain/entities/container.entity';
import { IContainerLogsService, CONTAINER_LOGS_SERVICE } from '../interfaces/container-logs-service.interface';

const logger = PinoLogger.child({ module: 'ContainerLogsService' }, { msgPrefix: '[CONTAINER_LOGS_SERVICE] - ' });

@Injectable()
export class ContainerLogsService implements IContainerLogsService {
  constructor(
    @Inject(CONTAINER_REPOSITORY)
    private readonly containerRepository: ContainerRepositoryInterface,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: WatcherEngineServiceInterface,
  ) {}

  /**
   * Find a container by UUID
   */
  async findContainerById(uuid: string): Promise<ContainerEntity> {
    const container = await this.containerRepository.findOneByUuid(uuid);
    if (!container) {
      throw new NotFoundException(`Container with UUID ${uuid} not found`);
    }
    return container;
  }

  /**
   * Find the Docker component for a watcher
   */
  async findRegisteredComponent(watcher: string): Promise<any> {
    const component = this.watcherEngineService.findRegisteredDockerComponent(watcher);
    if (!component) {
      throw new Error(`Docker watcher ${watcher} not found`);
    }
    return component;
  }

  /**
   * Get container logs
   */
  async getContainerLogs(uuid: string, options: any = {}): Promise<string> {
    try {
      const container = await this.findContainerById(uuid);
      
      if (!container.watchers || container.watchers.length === 0) {
        throw new Error(`Container ${uuid} has no associated watchers`);
      }
      
      const watcherName = container.watchers[0]; // Use the first watcher
      const dockerComponent = await this.findRegisteredComponent(watcherName);
      
      return dockerComponent.getContainerLogs(container.id, options);
    } catch (error) {
      logger.error(`Error getting logs for container ${uuid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stream container logs (WebSocket)
   */
  async streamContainerLogs(
    uuid: string, 
    onData: (data: string) => void, 
    onError: (error: Error) => void, 
    options: any = {}
  ): Promise<() => void> {
    try {
      const container = await this.findContainerById(uuid);
      
      if (!container.watchers || container.watchers.length === 0) {
        throw new Error(`Container ${uuid} has no associated watchers`);
      }
      
      const watcherName = container.watchers[0]; // Use the first watcher
      const dockerComponent = await this.findRegisteredComponent(watcherName);
      
      return dockerComponent.getContainerLiveLogs(
        container.id,
        options.from,
        onData,
      );
    } catch (error) {
      logger.error(`Error streaming logs for container ${uuid}: ${error.message}`);
      onError(error);
      return () => {
        logger.info(`Closed log stream for container ${uuid}`);
      };
    }
  }
}