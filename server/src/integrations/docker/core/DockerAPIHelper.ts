import Dockerode from 'dockerode';
import { ConnectConfig } from 'ssh2';
import { SSHType } from 'ssm-shared-lib/distribution/enums/ansible';
import Device from '../../../data/database/model/Device';
import DeviceAuth from '../../../data/database/model/DeviceAuth';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../../ansible-vault/vault';

function getDockerApiAuth() {
  const auth = {
    username: 'XXXX',
    password: 'XXX',
    email: 'XXXX',
    serveraddress: 'https://index.docker.io/v1',
  };
  return {
    authconfig: auth,
  };
}

async function getDockerSshConnectionOptions(device: Device, deviceAuth: DeviceAuth) {
  const options: Dockerode.DockerOptions & { modem?: any; _deviceUuid?: string } = {
    _deviceUuid: device.uuid,
    protocol: 'ssh',
    port: deviceAuth.sshPort,
    username: deviceAuth.sshUser,
    //TODO: If device change ip, reset watchers
    host: device.ip,
  };

  const basedSshOptions = {
    // TODO: Fix this
    tryKeyboard: true, //deviceAuth.customDockerTryKeyboard,
    forceIPv4: deviceAuth.customDockerForcev4,
    forceIPv6: deviceAuth.customDockerForcev6,
    host: device.ip,
    port: deviceAuth.sshPort,
  };
  // eslint-disable-next-line init-declarations
  let sshOptions: ConnectConfig = {};

  if (deviceAuth.customDockerSSH) {
    if (deviceAuth.dockerCustomAuthType === SSHType.KeyBased) {
      sshOptions = {
        username: deviceAuth.dockerCustomSshUser,
        privateKey: await vaultDecrypt(deviceAuth.dockerCustomSshKey as string, DEFAULT_VAULT_ID),
        passphrase: deviceAuth.dockerCustomSshKeyPass
          ? await vaultDecrypt(deviceAuth.dockerCustomSshKeyPass as string, DEFAULT_VAULT_ID)
          : undefined,
      } as ConnectConfig;
    } else if (deviceAuth.dockerCustomAuthType === SSHType.UserPassword) {
      sshOptions = {
        username: deviceAuth.dockerCustomSshUser,
        password: await vaultDecrypt(deviceAuth.dockerCustomSshPwd as string, DEFAULT_VAULT_ID),
      } as ConnectConfig;
    }
  } else {
    if (deviceAuth.authType === SSHType.KeyBased) {
      sshOptions = {
        username: deviceAuth.sshUser,
        privateKey: await vaultDecrypt(deviceAuth.sshKey as string, DEFAULT_VAULT_ID),
        passphrase: deviceAuth.sshKeyPass
          ? await vaultDecrypt(deviceAuth.sshKeyPass as string, DEFAULT_VAULT_ID)
          : undefined,
      } as ConnectConfig;
    } else if (deviceAuth.authType === SSHType.UserPassword) {
      sshOptions = {
        username: deviceAuth.sshUser,
        password: await vaultDecrypt(deviceAuth.sshPwd as string, DEFAULT_VAULT_ID),
      } as ConnectConfig;
    }
  }
  options.sshOptions = {
    ...basedSshOptions,
    ...sshOptions,
  };
  return options;
}

export default {
  getDockerApiAuth,
  getDockerSshConnectionOptions,
};
