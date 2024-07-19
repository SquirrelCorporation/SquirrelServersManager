import { SsmAnsible } from 'ssm-shared-lib';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Device from '../../../../data/database/model/Device';
import DeviceAuth from '../../../../data/database/model/DeviceAuth';
import * as vault from '../../../../modules/ansible-vault/ansible-vault';
import DockerAPIHelper from '../../../../modules/docker/core/DockerAPIHelper';

// The test cases
describe('getDockerSshConnectionOptions', () => {
  // Mock the vaultDecrypt function
  vi.mock('../../../../modules/ansible-vault/ansible-vault', async (importOriginal) => {
    return {
      ...(await importOriginal<typeof import('../../../../modules/ansible-vault/ansible-vault')>()),
      vaultDecrypt: async (value: string, vault: string) => {
        return value + '-decrypted';
      },
    };
  });

  // Setting up some basic data.
  let device: Device, deviceAuth: DeviceAuth;

  beforeEach(() => {
    vi.spyOn(vault, 'vaultDecrypt');
    // @ts-expect-error partial type
    device = {
      uuid: 'x',
      ip: '0.0.0.0',
    };

    deviceAuth = {
      sshPort: 22,
      sshUser: 'apiuser',
      sshKey: 'sshkey',
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
    deviceAuth.authType = SsmAnsible.SSHType.KeyBased;
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
        privateKey: 'sshkey-decrypted',
      },
    });

    expect(vault.vaultDecrypt).toHaveBeenCalledTimes(1);
  });

  test('should handle user-password SSHType for default Docker SSH', async () => {
    deviceAuth.authType = SsmAnsible.SSHType.UserPassword;
    deviceAuth.sshPwd = 'sshpwd';

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
        password: 'sshpwd-decrypted',
        username: 'apiuser',
      },
    });

    expect(vault.vaultDecrypt).toHaveBeenCalledTimes(1);
  });

  test('should handle key-based SSHType for custom Docker SSH', async () => {
    deviceAuth.authType = SsmAnsible.SSHType.UserPassword;
    deviceAuth.sshPwd = 'sshpwd';
    deviceAuth.customDockerSSH = true;
    deviceAuth.dockerCustomAuthType = SsmAnsible.SSHType.KeyBased;
    deviceAuth.dockerCustomSshUser = '$customUser';
    deviceAuth.dockerCustomSshKey = 'sshkey';
    deviceAuth.dockerCustomSshKeyPass = 'sshkeypass';

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
        passphrase: 'sshkeypass-decrypted',
        username: '$customUser',
        privateKey: 'sshkey-decrypted',
      },
    });

    expect(vault.vaultDecrypt).toHaveBeenCalledTimes(2);
  });

  test('should handle user-password SSHType for custom Docker SSH', async () => {
    deviceAuth.authType = SsmAnsible.SSHType.UserPassword;
    deviceAuth.sshPwd = 'sshpwd';
    deviceAuth.customDockerSSH = true;
    deviceAuth.dockerCustomAuthType = SsmAnsible.SSHType.UserPassword;
    deviceAuth.dockerCustomSshUser = '$customUser';
    deviceAuth.dockerCustomSshPwd = 'sshcustompwd';

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
        password: 'sshcustompwd-decrypted',
        username: '$customUser',
      },
    });

    expect(vault.vaultDecrypt).toHaveBeenCalledTimes(1);
  });
});
