import { OnModuleInit } from '@nestjs/common';
import { IDevice } from '../../../../modules/devices/domain/entities/device.entity';
// Add injection token
export const REMOTE_SYSTEM_INFORMATION_SERVICE = 'REMOTE_SYSTEM_INFORMATION_SERVICE';

/**
 * Interface for the Remote System Information Service
 */
export interface IRemoteSystemInformationService extends OnModuleInit {
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

  /**
   * Test connection to a device
   * @param uuid The UUID of the device to test connection to
   */
  testConnection(uuid: string): Promise<any>;
}
