import { IDevice } from '../entities/device.entity';
import { IDeviceAuth } from '../entities/device-auth.entity';
import { SsmAnsible } from 'ssm-shared-lib';

export const DEVICE_AUTH_SERVICE = 'IDeviceAuthService';

/**
 * Interface for the device auth service
 */
export interface IDeviceAuthService {
  findDeviceAuthByDevice(device: IDevice): Promise<IDeviceAuth | null>;
  findDeviceAuthByDeviceUuid(uuid: string): Promise<IDeviceAuth[] | null>;
  findManyByDevicesUuid(uuids: string[]): Promise<IDeviceAuth[] | null>;
  findAllPop(): Promise<IDeviceAuth[] | null>;
  findAllPopWithSshKey(): Promise<IDeviceAuth[] | null>;
  updateOrCreateDeviceAuth(deviceAuth: Partial<IDeviceAuth>): Promise<IDeviceAuth>;
  updateDeviceAuth(
    deviceAuth: IDeviceAuth, 
    updates?: {
      authType?: SsmAnsible.SSHType;
      sshUser?: string;
      sshPwd?: string;
      sshKey?: string;
      sshKeyPass?: string;
      becomeMethod?: SsmAnsible.AnsibleBecomeMethod;
      becomeUser?: string;
      becomePass?: string;
    }
  ): Promise<IDeviceAuth>;
  deleteDeviceAuthByDevice(device: IDevice): Promise<void>;
  deleteDeviceAuthCa(deviceAuth: IDeviceAuth): Promise<void>;
  deleteDeviceAuthCert(deviceAuth: IDeviceAuth): Promise<void>;
  deleteDeviceAuthKey(deviceAuth: IDeviceAuth): Promise<void>;
}