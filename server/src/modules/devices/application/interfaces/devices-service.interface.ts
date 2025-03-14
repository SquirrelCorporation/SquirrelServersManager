import { IDevice } from '../../domain/entities/device.entity';

export interface IDevicesService {
  findAll(): Promise<IDevice[] | null>;
  findOneByUuid(uuid: string): Promise<IDevice | null>;
  setDeviceOfflineAfter(inactivityInMinutes: number): Promise<void>;
  getDevicesOverview(): Promise<{ online?: number; offline?: number; totalCpu?: number; totalMem?: number; overview?: any }>;
}
