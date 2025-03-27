import { IDevice } from '../entities/device.entity';
import { IDeviceAuth } from '../entities/device-auth.entity';
import { SsmProxmox } from 'ssm-shared-lib';

export const PROXMOX_DEVICE_SERVICE = 'IProxmoxDeviceService';

export interface IProxmoxDeviceService {
  updateProxmoxAuth(
    deviceAuth: IDeviceAuth, 
    updates: {
      remoteConnectionMethod?: SsmProxmox.RemoteConnectionMethod;
      connectionMethod?: SsmProxmox.ConnectionMethod;
      port?: number;
      ignoreSslErrors?: boolean;
      tokens?: {
        tokenId?: string;
        tokenSecret?: string;
      };
      userPwd?: {
        username?: string;
        password?: string;
      };
    }
  ): Promise<IDeviceAuth>;
  getProxmoxDevicesToWatch(): Promise<IDevice[]>;
}