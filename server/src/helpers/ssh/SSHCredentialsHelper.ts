import Dockerode from 'dockerode';
import { ConnectConfig } from 'ssh2';
import { SsmAnsible, SsmProxmox } from 'ssm-shared-lib';
import Device from '../../data/database/model/Device';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../../modules/ansible-vault/ansible-vault';
import { ProxmoxEngineOptions } from '../proxmox-api';

class SSHCredentialsHelper {
  async getSShConnection(device: Device, deviceAuth: DeviceAuth) {
    const baseSsh: ConnectConfig = {
      tryKeyboard: true, // deviceAuth.customDockerTryKeyboard,
      forceIPv4: deviceAuth.customDockerForcev4,
      forceIPv6: deviceAuth.customDockerForcev6,
      host: device.ip,
      port: deviceAuth.sshPort,
    };
    const sshCredentials: ConnectConfig = await this.handleSSHCredentials(deviceAuth);
    return { ...baseSsh, ...sshCredentials };
  }

  async getDockerSshConnectionOptions(device: Device, deviceAuth: DeviceAuth) {
    const baseSsh: ConnectConfig = {
      tryKeyboard: true, // deviceAuth.customDockerTryKeyboard,
      forceIPv4: deviceAuth.customDockerForcev4,
      forceIPv6: deviceAuth.customDockerForcev6,
      host: device.ip,
      port: deviceAuth.sshPort,
    };

    const sshCredentials: ConnectConfig = deviceAuth.customDockerSSH
      ? await this.handleCustomSSHCredentials(deviceAuth)
      : await this.handleSSHCredentials(deviceAuth);

    const options: Dockerode.DockerOptions & { modem?: any; _deviceUuid?: string } = {
      _deviceUuid: device.uuid,
      protocol: 'ssh',
      port: deviceAuth.sshPort,
      username: deviceAuth.sshUser,
      //TODO: If device change ip, reset watchers
      host: device.ip,
      sshOptions: { ...baseSsh, ...sshCredentials },
      ca: (deviceAuth.dockerCa as Buffer) || undefined,
      cert: (deviceAuth.dockerCert as Buffer) || undefined,
      key: (deviceAuth.dockerKey as Buffer) || undefined,
    };

    return options;
  }

  async getProxmoxConnectionOptions(
    device: Device,
    deviceAuth: DeviceAuth,
  ): Promise<ProxmoxEngineOptions> {
    if (deviceAuth.proxmoxAuth?.method === SsmProxmox.ConnectionMethod.USER_PWD) {
      return {
        host: device.ip as string,
        port: deviceAuth.proxmoxAuth.port,
        username: deviceAuth.proxmoxAuth.userPwd?.userName,
        password: deviceAuth.proxmoxAuth.userPwd?.password as string,
      };
    }
    if (deviceAuth.proxmoxAuth?.method === SsmProxmox.ConnectionMethod.TOKENS) {
      return {
        host: device.ip as string,
        port: deviceAuth.proxmoxAuth.port,
        tokenID: deviceAuth.proxmoxAuth.token?.tokenId as string,
        tokenSecret: deviceAuth.proxmoxAuth.token?.tokenSecret as string,
      };
    }
    throw new Error(`Unsupported Proxmox connection method: ${deviceAuth.proxmoxAuth?.method}`);
  }

  private async handleSSHCredentials(deviceAuth: DeviceAuth): Promise<ConnectConfig> {
    return this.determineSSHCredentials(
      deviceAuth.authType as SsmAnsible.SSHType,
      deviceAuth.sshUser as string,
      deviceAuth.sshPwd,
      deviceAuth.sshKey,
      deviceAuth.sshKeyPass,
    );
  }

  private async handleCustomSSHCredentials(deviceAuth: DeviceAuth): Promise<ConnectConfig> {
    return this.determineSSHCredentials(
      deviceAuth.dockerCustomAuthType as SsmAnsible.SSHType,
      deviceAuth.dockerCustomSshUser as string,
      deviceAuth.dockerCustomSshPwd,
      deviceAuth.dockerCustomSshKey,
      deviceAuth.dockerCustomSshKeyPass,
    );
  }

  private async determineSSHCredentials(
    authType: SsmAnsible.SSHType,
    sshUsername: string,
    sshPwd?: string,
    sshKey?: string,
    sshKeyPass?: string,
  ): Promise<ConnectConfig> {
    let sshCredentials: ConnectConfig = {};
    switch (authType) {
      case SsmAnsible.SSHType.PasswordLess:
        sshCredentials = {
          username: sshUsername,
        };
        break;
      case SsmAnsible.SSHType.KeyBased:
        sshCredentials = {
          username: sshUsername,
          privateKey: sshKey ? await vaultDecrypt(sshKey, DEFAULT_VAULT_ID) : undefined,
          passphrase: sshKeyPass ? await vaultDecrypt(sshKeyPass, DEFAULT_VAULT_ID) : undefined,
        };
        break;
      case SsmAnsible.SSHType.UserPassword:
        sshCredentials = {
          username: sshUsername,
          password: sshPwd ? await vaultDecrypt(sshPwd, DEFAULT_VAULT_ID) : undefined,
        };
        break;
    }
    return sshCredentials;
  }
}

export default new SSHCredentialsHelper();
