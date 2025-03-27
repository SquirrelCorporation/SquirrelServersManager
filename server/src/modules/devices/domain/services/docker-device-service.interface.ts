import { IDevice } from '../entities/device.entity';
import { IDeviceAuth } from '../entities/device-auth.entity';
import { SsmAnsible } from 'ssm-shared-lib';

export const DOCKER_DEVICE_SERVICE = 'IDockerDeviceService';

export interface IDockerDeviceService {
  updateDockerAuth(
    deviceAuth: IDeviceAuth, 
    updates: {
      customDockerSSH?: boolean;
      dockerCustomAuthType?: SsmAnsible.SSHType;
      dockerCustomSshUser?: string;
      dockerCustomSshPwd?: string;
      dockerCustomSshKey?: string;
      dockerCustomSshKeyPass?: string;
      customDockerForcev6?: boolean;
      customDockerForcev4?: boolean;
      customDockerAgentForward?: boolean;
      customDockerTryKeyboard?: boolean;
      customDockerSocket?: string;
    }
  ): Promise<IDeviceAuth>;
  getDockerDevicesToWatch(): Promise<IDevice[]>;
}