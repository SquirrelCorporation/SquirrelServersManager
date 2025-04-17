import { IWatcherEngineService } from '@modules/containers/domain/components/watcher.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import PinoLogger from '../../../../logger';
import { IContainer } from '../../domain/entities/container.entity';
import { IContainerLogsService } from '../../domain/interfaces/container-logs-service.interface';
import { WATCHER_ENGINE_SERVICE } from '../../domain/interfaces/watcher-engine-service.interface';
import {
  CONTAINER_REPOSITORY,
  IContainerRepository,
} from '../../domain/repositories/container-repository.interface';

const logger = PinoLogger.child(
  { module: 'ContainerLogsService' },
  { msgPrefix: '[CONTAINER_LOGS_SERVICE] - ' },
);

@Injectable()
export class ContainerLogsService implements IContainerLogsService {
  constructor(
    @Inject(CONTAINER_REPOSITORY)
    private readonly containerRepository: IContainerRepository,
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: IWatcherEngineService,
  ) {}

  /**
   * Find a container by UUID
   */
  async getContainerById(id: string): Promise<IContainer> {
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
  async getContainerLiveLogs(
    id: string,
    from: number,
    callback: (data: string) => void,
  ): Promise<() => void> {
    try {
      const container = await this.getContainerById(id);

      if (!container.watcher) {
        throw new Error(`Container ${id} has no associated watchers`);
      }

      const dockerComponent = await this.findRegisteredComponent(container.watcher);

      return dockerComponent.getContainerLiveLogs(container.id, from, callback);
    } catch (error: any) {
      logger.error(`Error getting logs for container ${id}: ${error.message}`);
      throw error;
    }
  }
}
