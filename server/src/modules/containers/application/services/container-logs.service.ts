import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONTAINER_REPOSITORY } from '../../domain/repositories/container-repository.interface';
import { ContainerRepositoryInterface } from '../../domain/repositories/container-repository.interface';
import {
  IWatcherEngineService,
  WATCHER_ENGINE_SERVICE,
} from '../interfaces/watcher-engine-service.interface';
import PinoLogger from '../../../../logger';
import { ContainerEntity } from '../../domain/entities/container.entity';
import { IContainerLogsService } from '../interfaces/container-logs-service.interface';

const logger = PinoLogger.child(
  { module: 'ContainerLogsService' },
  { msgPrefix: '[CONTAINER_LOGS_SERVICE] - ' },
);

@Injectable()
export class ContainerLogsService implements IContainerLogsService {
  constructor(
    @Inject(CONTAINER_REPOSITORY)
    private readonly containerRepository: ContainerRepositoryInterface,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: IWatcherEngineService,
  ) {}

  /**
   * Find a container by UUID
   */
  async findContainerById(id: string): Promise<ContainerEntity> {
    const container = await this.containerRepository.findOneById(id);
    if (!container) {
      throw new NotFoundException(`Container with id ${id} not found`);
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
  async getContainerLogs(id: string, options: any = {}): Promise<string> {
    try {
      const container = await this.findContainerById(id);

      if (!container.watcher) {
        throw new Error(`Container ${id} has no associated watchers`);
      }

      const dockerComponent = await this.findRegisteredComponent(container.watcher);

      return dockerComponent.getContainerLogs(container.id, options);
    } catch (error: any) {
      logger.error(`Error getting logs for container ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stream container logs (WebSocket)
   */
  async streamContainerLogs(
    id: string,
    onData: (data: string) => void,
    onError: (error: Error) => void,
    options: any = {},
  ): Promise<() => void> {
    try {
      const container = await this.findContainerById(id);

      if (!container.watcher) {
        throw new Error(`Container ${id} has no associated watchers`);
      }

      const dockerComponent = await this.findRegisteredComponent(container.watcher);

      return dockerComponent.getContainerLiveLogs(container.id, options.from, onData);
    } catch (error: any) {
      logger.error(`Error streaming logs for container ${id}: ${error.message}`);
      onError(error);
      return () => {
        logger.info(`Closed log stream for container ${id}`);
      };
    }
  }
}
