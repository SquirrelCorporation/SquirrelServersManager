import { IDevice } from '../../../../modules/devices/domain/entities/device.entity';

/**
 * Interface for the Remote System Information Service
 */
export interface IRemoteSystemInformationService {
  /**
   * Initialize the system information service
   * This will start all watchers for devices that should be monitored
   */
  init(): Promise<void>;

  /**
   * Register a watcher for a specific device
   * @param device The device to register a watcher for
   */
  registerWatcher(device: IDevice): Promise<any>;

  /**
   * Register all watchers based on devices in the database
   */
  registerWatchers(): Promise<any>;

  /**
   * Deregister all components
   */
  deregisterAll(): Promise<any>;
}
