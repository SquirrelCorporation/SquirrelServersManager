import { Binary } from 'bson';
import { SsmAnsible, SsmProxmox } from 'ssm-shared-lib';
import { IDevice } from './device.entity';

/**
 * Device Auth entity interface in the domain layer
 */
export interface IDeviceAuth {
  device: IDevice | string; // Can be either the device object or its ID
  authType?: SsmAnsible.SSHType;
  sshUser?: string;
  sshPwd?: string;
  sshKey?: string;
  sshKeyPass?: string;
  sshPort?: number;
  sshConnection?: SsmAnsible.SSHConnection;
  becomeUser?: string;
  becomePass?: string;
  becomeMethod?: SsmAnsible.AnsibleBecomeMethod;
  becomeExe?: string;
  becomeFlags?: string;
  strictHostKeyChecking?: boolean;
  sshCommonArgs?: string;
  sshExecutable?: string;
  customDockerSSH?: boolean;
  dockerCustomAuthType?: SsmAnsible.SSHType;
  dockerCustomSshUser?: string;
  dockerCustomSshPwd?: string;
  dockerCustomSshKeyPass?: string;
  dockerCustomSshKey?: string;
  customDockerForcev6?: boolean;
  customDockerForcev4?: boolean;
  customDockerAgentForward?: boolean;
  customDockerTryKeyboard?: boolean;
  customDockerSocket?: string;
  proxmoxAuth?: {
    remoteConnectionMethod?: SsmProxmox.RemoteConnectionMethod;
    connectionMethod?: SsmProxmox.ConnectionMethod;
    ignoreSslErrors?: boolean;
    port?: number;
    userPwd?: {
      username?: string;
      password?: string;
    };
    tokens?: {
      tokenId?: string;
      tokenSecret?: string;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
  dockerKey?: Buffer | Binary | null;
  dockerCert?: Buffer | Binary | null;
  dockerCa?: Buffer | Binary | null;
}