import { IDevice } from '../entities/device.entity';

export const DEVICES_SERVICE = 'IDevicesService';

export interface IDevicesService {
  create(device: IDevice): Promise<IDevice>;
  update(device: IDevice): Promise<IDevice | null>;
  findOneByUuid(uuid: string): Promise<IDevice | null>;
  findOneByIp(ip: string): Promise<IDevice | null>;
  findAll(): Promise<IDevice[] | null>;
  findWithFilter(filter: Record<string, unknown>): Promise<IDevice[] | null>;
  setDeviceOfflineAfter(inactivityInMinutes: number): Promise<void>;
  deleteByUuid(uuid: string): Promise<void>;
  getDevicesOverview(): Promise<{
    online?: number;
    offline?: number;
    totalCpu?: number;
    totalMem?: number;
    overview?: any;
  }>;
}