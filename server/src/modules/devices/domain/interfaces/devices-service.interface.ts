import { IDevice } from '../../domain/entities/device.entity';

export const DEVICES_SERVICE = 'IDevicesService';

/**
 * Interface for the Devices Service
 */
export interface IDevicesService {
  /**
   * Create a new device
   * @param device Device data to create
   */
  create(device: IDevice): Promise<IDevice>;

  /**
   * Update an existing device
   * @param device Device data with updates
   */
  update(device: IDevice): Promise<IDevice | null>;

  /**
   * Find all devices
   */
  findAll(): Promise<IDevice[] | null>;

  /**
   * Find a device by UUID
   * @param uuid Device UUID
   */
  findOneByUuid(uuid: string): Promise<IDevice | null>;

  /**
   * Find devices by multiple UUIDs
   * @param uuids Array of device UUIDs
   */
  findByUuids(uuids: string[]): Promise<IDevice[] | null>;

  /**
   * Find a device by IP address
   * @param ip Device IP address
   */
  findOneByIp(ip: string): Promise<IDevice | null>;

  /**
   * Mark devices as offline after inactivity period
   * @param inactivityInMinutes Minutes of inactivity before marking offline
   */
  setDeviceOfflineAfter(inactivityInMinutes: number): Promise<void>;

  /**
   * Delete a device by UUID
   * @param uuid Device UUID
   */
  deleteByUuid(uuid: string): Promise<void>;

  /**
   * Find devices matching a filter
   * @param filter Filter criteria
   */
  findWithFilter(filter: Record<string, unknown>): Promise<IDevice[] | null>;

  /**
   * Get overview of all devices with summary statistics
   */
  getDevicesOverview(): Promise<{ 
    online?: number; 
    offline?: number; 
    totalCpu?: number; 
    totalMem?: number; 
    overview?: any 
  }>;
}
