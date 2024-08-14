import Dockerode from 'dockerode';
import { Config } from 'node-ssh';
import { ConnectConfig } from 'ssh2';
import { SSHType } from 'ssm-shared-lib/distribution/enums/ansible';
import Device from '../../data/database/model/Device';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../../modules/ansible-vault/ansible-vault';

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
      username: deviceAuth.sshUser, //TODO: If device change ip, reset watchers
      host: device.ip,
      sshOptions: { ...baseSsh, ...sshCredentials },
    };

    return options;
  }

  private async handleSSHCredentials(deviceAuth: DeviceAuth): Promise<ConnectConfig> {
    return this.determineSSHCredentials(
      deviceAuth.authType as SSHType,
      deviceAuth.sshUser as string,
      deviceAuth.sshPwd,
      deviceAuth.sshKey,
      deviceAuth.sshKeyPass,
    );
  }

  private async handleCustomSSHCredentials(deviceAuth: DeviceAuth): Promise<ConnectConfig> {
    return this.determineSSHCredentials(
      deviceAuth.dockerCustomAuthType as SSHType,
      deviceAuth.dockerCustomSshUser as string,
      deviceAuth.dockerCustomSshPwd,
      deviceAuth.dockerCustomSshKey,
      deviceAuth.dockerCustomSshKeyPass,
    );
  }

  private async determineSSHCredentials(
    authType: SSHType,
    sshUsername: string,
    sshPwd?: string,
    sshKey?: string,
    sshKeyPass?: string,
  ): Promise<ConnectConfig> {
    let sshCredentials: ConnectConfig = {};
    if (authType === SSHType.KeyBased) {
      sshCredentials = {
        username: sshUsername,
        privateKey: sshKey ? await vaultDecrypt(sshKey, DEFAULT_VAULT_ID) : undefined,
        passphrase: sshKeyPass ? await vaultDecrypt(sshKeyPass, DEFAULT_VAULT_ID) : undefined,
      };
    } else if (authType === SSHType.UserPassword) {
      sshCredentials = {
        username: sshUsername,
        password: sshPwd ? await vaultDecrypt(sshPwd, DEFAULT_VAULT_ID) : undefined,
      };
    }
    return sshCredentials;
  }
}

export default new SSHCredentialsHelper();
