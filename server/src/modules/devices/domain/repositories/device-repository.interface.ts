import { IDevice } from '../entities/device.entity';

export const DEVICE_REPOSITORY = 'DEVICE_REPOSITORY';

/**
 * Device repository interface in the domain layer
 */
export interface IDeviceRepository {
  create(device: IDevice): Promise<IDevice>;
  update(device: IDevice): Promise<IDevice | null>;
  findOneByUuid(uuid: string): Promise<IDevice | null>;
  findByUuids(uuids: string[]): Promise<IDevice[] | null>;
  findOneByIp(ip: string): Promise<IDevice | null>;
  findAll(): Promise<IDevice[] | null>;
  setDeviceOfflineAfter(inactivityInMinutes: number): Promise<void>;
  deleteByUuid(uuid: string): Promise<void>;
  findWithFilter(filter: any): Promise<IDevice[] | null>;
}