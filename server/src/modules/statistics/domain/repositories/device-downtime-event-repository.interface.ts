import { IDeviceDownTimeEvent } from '../entities/device-downtime-event.entity';

export const DEVICE_DOWNTIME_EVENT_REPOSITORY = 'DEVICE_DOWNTIME_EVENT_REPOSITORY';

/**
 * Device Downtime Event repository interface in the domain layer
 */
export interface IDeviceDownTimeEventRepository {
  create(deviceId: string): Promise<IDeviceDownTimeEvent>;
  closeDownTimeEvent(deviceId: string): Promise<void>;
  sumTotalDownTimePerDeviceOnPeriod(from: Date, to: Date): Promise<{ deviceId: string; duration: number }[]>;
}