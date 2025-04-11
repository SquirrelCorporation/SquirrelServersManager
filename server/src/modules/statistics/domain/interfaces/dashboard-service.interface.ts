import { IDevice } from '@modules/devices';

export const DASHBOARD_SERVICE = 'DASHBOARD_SERVICE';

/**
 * Interface for the Dashboard Service
 */
export interface IDashboardService {
  /**
   * Get system performance metrics
   * @returns Object containing system performance data and status
   */
  getSystemPerformance(): Promise<{
    currentMem: number;
    previousMem: number;
    currentCpu: number;
    previousCpu: number;
    message: string;
    danger: boolean;
  }>;

  /**
   * Get devices availability information
   * @returns Device availability metrics
   */
  getDevicesAvailability(): Promise<any>;

  /**
   * Get averaged statistics for specified devices
   * @param devices Array of device UUIDs
   * @param from Start date
   * @param to End date
   * @param type Stat type to query
   * @returns Averaged stats data
   */
  getStatsByDevicesAndType(devices: IDevice[], from: Date, to: Date, type: string): Promise<any>;

  /**
   * Get dashboard statistics
   * @param from Start date
   * @param to End date
   * @param type Stat type to query
   * @returns Dashboard statistics data
   */
  getAveragedStatsByType(from: Date, to: Date, type: string): Promise<any>;
}
