import { ContainerEntity } from '../../domain/entities/container.entity';

export const CONTAINER_LOGS_SERVICE = 'CONTAINER_LOGS_SERVICE';

/**
 * Interface for the Container Logs Service
 */
export interface IContainerLogsService {
  /**
   * Find a container by ID
   * @param id Container ID
   * @returns Container entity
   */
  findContainerById(id: string): Promise<ContainerEntity>;

  /**
   * Find a registered Docker component for a watcher
   * @param watcher Watcher name
   * @returns Docker component
   */
  findRegisteredComponent(watcher: string): Promise<any>;
  
  /**
   * Get container logs
   * @param uuid Container UUID
   * @param options Log options
   * @returns Container logs as string
   */
  getContainerLogs(uuid: string, options?: any): Promise<string>;
  
  /**
   * Stream container logs (WebSocket)
   * @param uuid Container UUID
   * @param onData Callback for data events
   * @param onError Callback for error events
   * @param options Log options
   * @returns Function to close the stream
   */
  streamContainerLogs(
    uuid: string, 
    onData: (data: string) => void, 
    onError: (error: Error) => void, 
    options?: any
  ): Promise<() => void>;
}