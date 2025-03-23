import { IDevice } from '../../domain/entities/device.entity';

export const DEVICES_SERVICE = 'IDevicesService';

export interface IDevicesService {
  findAll(): Promise<IDevice[] | null>;
  findOneByUuid(uuid: string): Promise<IDevice | null>;
  setDeviceOfflineAfter(inactivityInMinutes: number): Promise<void>;
  getDevicesOverview(): Promise<{ online?: number; offline?: number; totalCpu?: number; totalMem?: number; overview?: any }>;
}
