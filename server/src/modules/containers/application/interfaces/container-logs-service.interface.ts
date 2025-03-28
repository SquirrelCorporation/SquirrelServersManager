import { IContainerEntity } from '@modules/containers/domain/entities/container.entity';

export const CONTAINER_LOGS_SERVICE = 'CONTAINER_LOGS_SERVICE';

/**
 * Interface for the Container Logs Service
 */
export interface IContainerLogsService {
  findContainerById(id: string): Promise<IContainerEntity>;

  getContainerLiveLogs(
    containerId: string,
    from: number,
    callback: (data: string) => void,
  ): Promise<() => void>;
}
