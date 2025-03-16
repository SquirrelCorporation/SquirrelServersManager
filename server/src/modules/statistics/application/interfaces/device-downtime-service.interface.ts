import { OnModuleInit } from '@nestjs/common';

export const DEVICE_DOWNTIME_SERVICE = 'DEVICE_DOWNTIME_SERVICE';

/**
 * Interface for the Device Downtime Service
 */
export interface IDeviceDowntimeService extends OnModuleInit {
  /**
   * Initialize the device downtime service
   */
  onModuleInit(): void;

  /**
   * Handle device went offline event
   * @param deviceId Device ID that went offline
   */
  handleDeviceWentOffline(deviceId: string): Promise<void>;

  /**
   * Handle device came online event
   * @param deviceId Device ID that came online
   */
  handleDeviceCameOnline(deviceId: string): Promise<void>;

  /**
   * Create a downtime event for a device
   * @param deviceId Device ID
   */
  createDowntimeEvent(deviceId: string): Promise<void>;

  /**
   * Close a downtime event for a device
   * @param deviceId Device ID
   */
  closeDowntimeEvent(deviceId: string): Promise<void>;

  /**
   * Get availability statistics for devices in the current and last month
   * @returns Availability statistics including current month, last month, and by device
   */
  getDevicesAvailabilitySumUpCurrentMonthLastMonth(): Promise<{
    availability: number;
    lastMonth: number;
    byDevice: Array<{
      uuid: string;
      uptime: number;
      downtime: number;
      availability: string;
    }>;
  }>;
}