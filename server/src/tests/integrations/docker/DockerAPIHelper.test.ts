import { ConnectConfig } from 'ssh2';
import { SSHType } from 'ssm-shared-lib/distribution/enums/ansible';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Device from '../../../data/database/model/Device';
import DeviceAuth from '../../../data/database/model/DeviceAuth';
import * as vault from '../../../integrations/ansible-vault/vault';
import DockerAPIHelper from '../../../integrations/docker/core/DockerAPIHelper';

// The test cases
describe('getDockerSshConnectionOptions', () => {
  // Mock the vaultDecrypt function
  vi.mock('../../../integrations/ansible-vault/vault', async (importOriginal) => {
    return {
      ...(await importOriginal<typeof import('../../../data/database/repository/DeviceRepo')>()),
      vaultDecrypt: async (value: string, vault: string) => {
        return value;
      },
    };
  });

  // Setting up some basic data.
  let device: Device, deviceAuth: DeviceAuth;

  beforeEach(() => {
    const spy = vi.spyOn(vault, 'vaultDecrypt');
    // @ts-expect-error partial type
    device = {
      uuid: 'x',
      ip: '0.0.0.0',
    };

    deviceAuth = {
      sshPort: 22,
      sshUser: 'apiuser',
      sshKey: '!2#4%',
      // @ts-expect-error partial type
      authType: '',
      sshKeyPass: undefined,
      sshPwd: undefined,
      customDockerSSH: undefined,
      customDockerForcev4: undefined,
      customDockerForcev6: undefined,
      dockerCustomAuthType: undefined,
      dockerCustomSshKey: undefined,
      dockerCustomSshUser: undefined,
      dockerCustomSshKeyPass: undefined,
      dockerCustomSshPwd: undefined,
    };
  });

  test('should handle key-based SSHType for default Docker SSH', async () => {
    deviceAuth.authType = SSHType.KeyBased;
    const result = DockerAPIHelper.getDockerSshConnectionOptions(device, deviceAuth);

    expect(result).resolves.toMatchObject({
      protocol: 'ssh',
      port: 22,
      username: 'apiuser',
      host: '0.0.0.0',
      _deviceUuid: 'x',
      sshOptions: {
        tryKeyboard: true,
        forceIPv4: undefined,
        forceIPv6: undefined,
        host: '0.0.0.0',
        port: 22,
        passphrase: undefined,
        username: 'apiuser',
        privateKey: '!2#4%',
      },
    });

    expect(vault.vaultDecrypt).toHaveBeenCalledTimes(1);
  });

  test('should handle user-password SSHType for default Docker SSH', async () => {
    deviceAuth.authType = SSHType.UserPassword;
    deviceAuth.sshPwd = '!2#4%';

    const result = await DockerAPIHelper.getDockerSshConnectionOptions(device, deviceAuth);

    expect(result).toMatchObject({
      protocol: 'ssh',
      port: 22,
      username: 'apiuser',
      host: '0.0.0.0',
      _deviceUuid: 'x',
      sshOptions: {
        tryKeyboard: true,
        forceIPv4: undefined,
        forceIPv6: undefined,
        host: '0.0.0.0',
        port: 22,
        password: '!2#4%',
        username: 'apiuser',
      },
    });

    expect(vault.vaultDecrypt).toHaveBeenCalledTimes(1);
  });

  test('should handle key-based SSHType for custom Docker SSH', async () => {
    deviceAuth.authType = SSHType.UserPassword;
    deviceAuth.sshPwd = '!2#4%';
    deviceAuth.customDockerSSH = true;
    deviceAuth.dockerCustomAuthType = SSHType.KeyBased;
    deviceAuth.dockerCustomSshUser = '$customUser';
    deviceAuth.dockerCustomSshKey = 'decrypted';
    deviceAuth.dockerCustomSshKeyPass = 'decrypted';

    const result = await DockerAPIHelper.getDockerSshConnectionOptions(device, deviceAuth);

    expect(result).toMatchObject({
      protocol: 'ssh',
      port: 22,
      username: 'apiuser',
      host: '0.0.0.0',
      _deviceUuid: 'x',
      sshOptions: {
        tryKeyboard: true,
        forceIPv4: undefined,
        forceIPv6: undefined,
        host: '0.0.0.0',
        port: 22,
        passphrase: 'decrypted',
        username: '$customUser',
        privateKey: 'decrypted',
      },
    });

    expect(vault.vaultDecrypt).toHaveBeenCalledTimes(2);
  });

  test('should handle user-password SSHType for custom Docker SSH', async () => {
    deviceAuth.authType = SSHType.UserPassword;
    deviceAuth.sshPwd = '!2#4%';
    deviceAuth.customDockerSSH = true;
    deviceAuth.dockerCustomAuthType = SSHType.UserPassword;
    deviceAuth.dockerCustomSshUser = '$customUser';
    deviceAuth.dockerCustomSshPwd = 'decrypted';

    const result = await DockerAPIHelper.getDockerSshConnectionOptions(device, deviceAuth);

    expect(result).toMatchObject({
      protocol: 'ssh',
      port: 22,
      username: 'apiuser',
      host: '0.0.0.0',
      _deviceUuid: 'x',
      sshOptions: {
        tryKeyboard: true,
        forceIPv4: undefined,
        forceIPv6: undefined,
        host: '0.0.0.0',
        port: 22,
        password: 'decrypted',
        username: '$customUser',
      },
    });

    expect(vault.vaultDecrypt).toHaveBeenCalledTimes(1);
  });
});
