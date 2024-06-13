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
    username: deviceAuth.sshUser, //TODO: If device change ip, reset watchers
    host: device.ip,
  };

  const baseSsh: ConnectConfig = {
    tryKeyboard: true, //deviceAuth.customDockerTryKeyboard,
    forceIPv4: deviceAuth.customDockerForcev4,
    forceIPv6: deviceAuth.customDockerForcev6,
    host: device.ip,
    port: deviceAuth.sshPort,
  };

  let sshCredentials: ConnectConfig = {};
  if (deviceAuth.customDockerSSH) {
    const sshUsername = deviceAuth.dockerCustomSshUser;
    const sshPwd = deviceAuth.dockerCustomSshPwd;
    const sshKey = deviceAuth.dockerCustomSshKey;
    const sshKeyPass = deviceAuth.dockerCustomSshKeyPass;
    if (deviceAuth.dockerCustomAuthType === SSHType.KeyBased) {
      sshCredentials = {
        username: sshUsername,
        privateKey: sshKey ? await vaultDecrypt(sshKey, DEFAULT_VAULT_ID) : undefined,
        passphrase: sshKeyPass ? await vaultDecrypt(sshKeyPass, DEFAULT_VAULT_ID) : undefined,
      };
    } else if (deviceAuth.dockerCustomAuthType === SSHType.UserPassword) {
      sshCredentials = {
        username: sshUsername,
        password: sshPwd ? await vaultDecrypt(sshPwd, DEFAULT_VAULT_ID) : undefined,
      };
    }
  } else {
    const sshUsername = deviceAuth.sshUser;
    const sshPwd = deviceAuth.sshPwd;
    const sshKey = deviceAuth.sshKey;
    const sshKeyPass = deviceAuth.sshKeyPass;
    if (deviceAuth.authType === SSHType.KeyBased) {
      sshCredentials = {
        username: sshUsername,
        privateKey: sshKey ? await vaultDecrypt(sshKey, DEFAULT_VAULT_ID) : undefined,
        passphrase: sshKeyPass ? await vaultDecrypt(sshKeyPass, DEFAULT_VAULT_ID) : undefined,
      };
    } else if (deviceAuth.authType === SSHType.UserPassword) {
      sshCredentials = {
        username: sshUsername,
        password: sshPwd ? await vaultDecrypt(sshPwd, DEFAULT_VAULT_ID) : undefined,
      };
    }
  }

  options.sshOptions = { ...baseSsh, ...sshCredentials };
  return options;
}

export default {
  getDockerApiAuth,
  getDockerSshConnectionOptions,
};
