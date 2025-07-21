import { IContainer } from '@modules/containers/domain/entities/container.entity';
import { WATCHERS } from '@modules/containers/constants';

export const CONTAINER_LOGS_SERVICE = 'CONTAINER_LOGS_SERVICE';

/**
 * Interface for the Container Logs Service
 */
export interface IContainerLogsService {
  /**
   * Get a container by ID
   */
  getContainerById(id: string): Promise<IContainer>;

  /**
   * Get live logs for a container
   */
  getContainerLiveLogs(
    containerId: string,
    from: number,
    callback: (data: string) => void,
  ): Promise<() => void>;

  /**
   * Find a registered watcher component
   */
  findRegisteredWatcherComponent(
    watcher: string,
    watcherType: (typeof WATCHERS)[keyof typeof WATCHERS],
  ): Promise<any>;
}
