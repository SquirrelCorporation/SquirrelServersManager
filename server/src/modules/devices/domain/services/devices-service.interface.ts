import { IDevice } from '../entities/device.entity';
import { CreateDeviceDto } from '../../presentation/dtos/device.dto';

export const DEVICES_SERVICE = 'DEVICES_SERVICE';

/**
 * Interface for the devices service
 */
export interface IDevicesService {
  create(device: CreateDeviceDto): Promise<IDevice>;
  update(device: IDevice): Promise<IDevice | null>;
  findOneByUuid(uuid: string): Promise<IDevice | null>;
  findByUuids(uuids: string[]): Promise<IDevice[] | null>;
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
