import { IDevice } from '../entities/device.entity';
import { IDeviceAuth } from '../entities/device-auth.entity';

export const DEVICE_AUTH_REPOSITORY = 'DEVICE_AUTH_REPOSITORY';

/**
 * Device Auth repository interface in the domain layer
 */
export interface IDeviceAuthRepository {
  updateOrCreateIfNotExist(deviceAuth: IDeviceAuth): Promise<IDeviceAuth>;
  update(deviceAuth: IDeviceAuth): Promise<IDeviceAuth | undefined>;
  findOneByDevice(device: IDevice): Promise<IDeviceAuth | null>;
  findOneByDeviceUuid(uuid: string): Promise<IDeviceAuth[] | null>;
  findManyByDevicesUuid(uuids: string[]): Promise<IDeviceAuth[] | null>;
  findAllPop(): Promise<IDeviceAuth[] | null>;
  findAllPopWithSshKey(): Promise<IDeviceAuth[] | null>;
  deleteByDevice(device: IDevice): Promise<void>;
  deleteCa(deviceAuth: IDeviceAuth): Promise<void>;
  deleteCert(deviceAuth: IDeviceAuth): Promise<void>;
  deleteKey(deviceAuth: IDeviceAuth): Promise<void>;
}