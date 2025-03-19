import { ContainerEntity } from '../../domain/entities/container.entity';

export const CONTAINER_LOGS_SERVICE = 'CONTAINER_LOGS_SERVICE';

/**
 * Interface for the Container Logs Service
 */
export interface IContainerLogsService {
  /**
   * Get container logs
   * @param uuid Container UUID
   * @param options Log options
   * @returns Container logs
   */
  getContainerLogs(uuid: string, options?: any): Promise<string[]>;
}