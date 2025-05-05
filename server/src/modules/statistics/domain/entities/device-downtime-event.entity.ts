/**
 * Device Downtime Event entity interface in the domain layer
 */
export interface IDeviceDownTimeEvent {
  _id?: string;
  deviceId: string;
  finishedAt?: Date;
  duration?: number;
  createdAt?: Date;
  updatedAt?: Date;
}