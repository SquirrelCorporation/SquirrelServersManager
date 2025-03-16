import { IDevice } from '../../../devices/domain/entities/device.entity';

export const DEVICE_STATS_SERVICE = 'DEVICE_STATS_SERVICE';

/**
 * Interface for the Device Stats Service
 */
export interface IDeviceStatsService {
  /**
   * Get statistics for a specific device and type
   * @param device Device entity
   * @param from Start date
   * @param to End date
   * @param type Stat type to query
   * @returns Statistics data or null
   */
  getStatsByDeviceAndType(
    device: IDevice,
    from: Date,
    to: Date,
    type?: string
  ): Promise<{ date: Date; value: number }[] | null>;

  /**
   * Get statistics for multiple devices and type
   * @param devices Array of device entities
   * @param from Start date
   * @param to End date
   * @param type Stat type to query
   * @returns Statistics data or null
   */
  getStatsByDevicesAndType(
    devices: IDevice[],
    from: Date,
    to: Date,
    type?: string
  ): Promise<any | null>;

  /**
   * Get single averaged statistics for devices by IDs
   * @param deviceIds Array of device UUIDs
   * @param from Start date
   * @param to End date
   * @param type Stat type to query
   * @returns Averaged statistics data or null
   */
  getSingleAveragedStatsByDevicesAndType(
    deviceIds: string[],
    from: Date,
    to: Date,
    type?: string
  ): Promise<any | null>;

  /**
   * Get latest statistics for a device and type
   * @param device Device entity
   * @param type Stat type to query
   * @returns Latest statistics data or null
   */
  getStatByDeviceAndType(
    device: IDevice,
    type?: string
  ): Promise<{ value: number; date: Date }[] | null>;

  /**
   * Get single averaged statistic for a type over a time period
   * @param days Number of days to query
   * @param offset Offset in days
   * @param type Stat type to query
   * @returns Averaged statistic data or null
   */
  getSingleAveragedStatByType(
    days: number,
    offset: number,
    type?: string
  ): Promise<{ value: number }[] | null>;

  /**
   * Get averaged statistics for a type over a date range
   * @param from Start date
   * @param to End date
   * @param type Stat type to query
   * @returns Averaged statistics data or null
   */
  getAveragedStatsByType(
    from: Date,
    to: Date,
    type?: string
  ): Promise<any | null>;
}