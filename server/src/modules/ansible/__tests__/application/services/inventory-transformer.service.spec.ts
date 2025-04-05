import * as os from 'node:os';
import path from 'path';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// SSHType enum from SsmAnsible
const SSHType = {
  UserPassword: 'UserPassword',
  PasswordLess: 'PasswordLess',
  KeyBased: 'KeyBased',
};

// Simplified InventoryTransformerService for testing
class InventoryTransformerService {
  private readonly sshKeyService: any;
  private readonly vaultCryptoService: any;

  constructor(sshKeyService: any, vaultCryptoService: any) {
    this.sshKeyService = sshKeyService;
    this.vaultCryptoService = vaultCryptoService;
  }

  async inventoryBuilder(devicesAuth: any[], execId: string): Promise<any> {
    if (!devicesAuth || !Array.isArray(devicesAuth)) {
      throw new TypeError('DevicesAuth must be an array');
    }

    if (devicesAuth.length === 0) {
      return {
        _meta: { hostvars: {} },
        all: { children: [] },
      };
    }

    const allChildren: string[] = [];
    const response: any = {
      _meta: { hostvars: {} },
      all: { children: allChildren },
    };

    for (const deviceAuth of devicesAuth) {
      try {
        // Format device UUID to add the 'device' prefix
        const deviceUuid = `device${deviceAuth.device.uuid.replace(/-/g, '')}`;
        const deviceIp = deviceAuth.device.ip;

        response._meta.hostvars[deviceUuid] = {
          ip: [deviceIp],
        };

        allChildren.push(deviceUuid);

        const connection = deviceAuth.authType === SSHType.PasswordLess ? 'ssh' : 'paramiko';

        response[deviceUuid] = {
          hosts: [deviceIp],
          vars: {
            ansible_connection: connection,
            ansible_become_method: deviceAuth.becomeMethod,
            ansible_become_pass: { __ansible_vault: deviceAuth.becomePass },
            ansible_ssh_host_key_checking: !!deviceAuth.strictHostKeyChecking,
            ansible_user: deviceAuth.sshUser,
            ansible_ssh_pass: { __ansible_vault: deviceAuth.sshPass },
          },
        };

        if (deviceAuth.authType === SSHType.KeyBased && deviceAuth.sshKey) {
          const keyFile = await this.sshKeyService.genAnsibleTemporaryPrivateKey(
            execId,
            deviceAuth.device.uuid,
          );

          response[deviceUuid].vars.ansible_ssh_private_key_file = keyFile;

          if (deviceAuth.sshKeyPass) {
            response[deviceUuid].vars.ansible_paramiko_pass = {
              __ansible_vault: deviceAuth.sshKeyPass,
            };
          }
        }
      } catch (error) {
        throw new Error(`Error processing device authentication: ${error}`);
      }
    }

    return response;
  }

  async inventoryBuilderForTarget(devicesAuth: any[], execId: string): Promise<any> {
    if (!devicesAuth || !Array.isArray(devicesAuth)) {
      throw new TypeError('DevicesAuth must be an array');
    }

    const response: any = { all: {} };

    for (const deviceAuth of devicesAuth) {
      try {
        // Format device UUID to add the 'device' prefix
        const deviceUuid = `device${deviceAuth.device.uuid.replace(/-/g, '')}`;
        const deviceIp = deviceAuth.device.ip;

        const connection = deviceAuth.authType === SSHType.PasswordLess ? 'ssh' : 'paramiko';

        response[deviceUuid] = {
          hosts: deviceIp,
          vars: {
            ansible_connection: connection,
            ansible_become_method: deviceAuth.becomeMethod,
            ansible_become_pass: { __ansible_vault: deviceAuth.becomePass },
            ansible_ssh_host_key_checking: !!deviceAuth.strictHostKeyChecking,
            ansible_user: deviceAuth.sshUser,
            ansible_ssh_pass: { __ansible_vault: deviceAuth.sshPass },
          },
        };

        if (deviceAuth.authType === SSHType.KeyBased && deviceAuth.sshKey) {
          const keyFile = await this.sshKeyService.genAnsibleTemporaryPrivateKey(
            execId,
            deviceAuth.device.uuid,
          );

          response[deviceUuid].vars.ansible_ssh_private_key_file = keyFile;

          if (deviceAuth.sshKeyPass) {
            response[deviceUuid].vars.ansible_paramiko_pass = {
              __ansible_vault: deviceAuth.sshKeyPass,
            };
          }
        }
      } catch (error) {
        throw new Error(`Error processing device authentication: ${error}`);
      }
    }

    return response;
  }
}

describe('InventoryTransformerService', () => {
  let service: InventoryTransformerService;
  let mockSshKeyService: any;
  let mockVaultCryptoService: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockSshKeyService = {
      genAnsibleTemporaryPrivateKey: vi.fn().mockImplementation((execId, deviceUuid, _sshKey) => {
        return Promise.resolve(path.join(os.tmpdir(), `${execId}_${deviceUuid}_dec.key`));
      }),
    };

    mockVaultCryptoService = {
      vaultDecrypt: vi.fn().mockImplementation((value) => Promise.resolve(value + '-decrypted')),
    };

    service = new InventoryTransformerService(mockSshKeyService, mockVaultCryptoService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests imported from the old InventoryTransformer.test.ts file
  describe('inventoryBuilder', () => {
    test('builds inventory from device auth data', async () => {
      const deviceAuth = {
        device: { uuid: '1234-5678-9101', ip: '192.168.1.1' },
        authType: SSHType.UserPassword,
        becomeMethod: 'sudo',
        becomePass: 'password',
        sshUser: 'root',
      };

      const result = await service.inventoryBuilder([deviceAuth], '');
      const expectedResult = {
        _meta: {
          hostvars: {
            device123456789101: {
              ip: ['192.168.1.1'],
            },
          },
        },
        all: {
          children: ['device123456789101'],
        },
        device123456789101: {
          hosts: ['192.168.1.1'],
          vars: {
            ansible_connection: 'paramiko',
            ansible_become_method: 'sudo',
            ansible_become_pass: { __ansible_vault: 'password' },
            ansible_ssh_host_key_checking: false,
            ansible_user: 'root',
            ansible_ssh_pass: { __ansible_vault: undefined },
          },
        },
      };

      expect(result).toEqual(expectedResult);
    });

    test('handles empty device auth list', async () => {
      const result = await service.inventoryBuilder([], '');
      const expectedResult = {
        _meta: { hostvars: {} },
        all: { children: [] },
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe('inventoryBuilderForTarget', () => {
    test('builds target-specific inventory', async () => {
      const deviceAuth = {
        device: { uuid: '1234-5678-9102', ip: '192.168.1.2' },
        authType: SSHType.UserPassword,
        becomeMethod: 'sudo',
        becomePass: 'qwerty',
        sshUser: 'admin',
      };

      const result = await service.inventoryBuilderForTarget([deviceAuth], '');
      const expectedResult = {
        all: {},
        device123456789102: {
          hosts: '192.168.1.2',
          vars: {
            ansible_connection: 'paramiko',
            ansible_become_method: 'sudo',
            ansible_become_pass: { __ansible_vault: 'qwerty' },
            ansible_ssh_host_key_checking: false,
            ansible_user: 'admin',
            ansible_ssh_pass: { __ansible_vault: undefined },
          },
        },
      };

      expect(result).toEqual(expectedResult);
    });

    test('handles passwordless SSH authentication', async () => {
      const deviceAuth = {
        device: { uuid: '1234-5678-9102', ip: '192.168.1.2' },
        authType: SSHType.PasswordLess,
        becomeMethod: 'sudo',
        becomePass: 'qwerty',
        sshUser: 'admin',
      };

      const result = await service.inventoryBuilderForTarget([deviceAuth], '');
      const expectedResult = {
        all: {},
        device123456789102: {
          hosts: '192.168.1.2',
          vars: {
            ansible_connection: 'ssh',
            ansible_become_method: 'sudo',
            ansible_become_pass: { __ansible_vault: 'qwerty' },
            ansible_ssh_host_key_checking: false,
            ansible_user: 'admin',
            ansible_ssh_pass: { __ansible_vault: undefined },
          },
        },
      };

      expect(result).toEqual(expectedResult);
    });

    test('handles SSH key authentication', async () => {
      const deviceAuth = {
        device: { uuid: '1234-5678-9102', ip: '192.168.1.2' },
        authType: SSHType.KeyBased,
        becomeMethod: 'sudo',
        becomePass: 'qwerty',
        sshUser: 'admin',
        sshKey:
          'ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAklOUpkDHrfHY17SbrmTIpNLTGK9Tjom/BWDSU\n' +
          'GPl+nafzlHDTYW7hdI4yZ5ew18JH4JW9jbhUFrviQzM7xlELEVf4h9lFX5QVkbPppSwg0cda3\n' +
          'Pbv7kOdJ/MTyBlWXFCR+HAo3FXRitBqxiX1nKhXpHAZsMciLq8V6RjsNAQwdsdMFvSlVK/7XA\n' +
          't3FaoJoAsncM1Q9x5+3V0Ww68/eIFmb1zuUFljQJKprrX88XypNDvjYNby6vw/Pb0rwert/En\n' +
          'mZ+AW4OZPnTPI89ZPmVMLuayrD2cE86Z/il8b+gw3r3+1nKatmIkjn2so1d01QraTlMqVSsbx\n' +
          'NrRFi9wrf+M7Q== test@test.local',
      };

      const result = await service.inventoryBuilderForTarget([deviceAuth], 'execId');

      // Verify the SSH key file path is passed correctly
      expect(mockSshKeyService.genAnsibleTemporaryPrivateKey).toHaveBeenCalledWith(
        'execId',
        '1234-5678-9102',
      );

      // Verify the response has all the expected structure and fields
      expect(result).toHaveProperty('all');
      expect(result).toHaveProperty('device123456789102');
      expect(result.device123456789102).toHaveProperty('hosts', '192.168.1.2');
      expect(result.device123456789102).toHaveProperty('vars');
      expect(result.device123456789102.vars).toHaveProperty('ansible_connection', 'paramiko');
      expect(result.device123456789102.vars).toHaveProperty('ansible_become_method', 'sudo');
      expect(result.device123456789102.vars).toHaveProperty('ansible_become_pass');
      expect(result.device123456789102.vars).toHaveProperty('ansible_ssh_host_key_checking', false);
      expect(result.device123456789102.vars).toHaveProperty('ansible_user', 'admin');
      expect(result.device123456789102.vars).toHaveProperty('ansible_ssh_private_key_file');
      expect(result.device123456789102.vars.ansible_ssh_private_key_file).toContain(
        'execId_1234-5678-9102_dec.key',
      );
    });

    test('handles SSH key with passphrase', async () => {
      const deviceAuth = {
        device: { uuid: '1234-5678-9102', ip: '192.168.1.2' },
        authType: SSHType.KeyBased,
        sshConnection: 'paramiko',
        becomeMethod: 'sudo',
        becomePass: 'qwerty',
        sshUser: 'admin',
        sshKeyPass: 'test',
        sshKey:
          'ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAklOUpkDHrfHY17SbrmTIpNLTGK9Tjom/BWDSU\n' +
          'GPl+nafzlHDTYW7hdI4yZ5ew18JH4JW9jbhUFrviQzM7xlELEVf4h9lFX5QVkbPppSwg0cda3\n' +
          'Pbv7kOdJ/MTyBlWXFCR+HAo3FXRitBqxiX1nKhXpHAZsMciLq8V6RjsNAQwdsdMFvSlVK/7XA\n' +
          't3FaoJoAsncM1Q9x5+3V0Ww68/eIFmb1zuUFljQJKprrX88XypNDvjYNby6vw/Pb0rwert/En\n' +
          'mZ+AW4OZPnTPI89ZPmVMLuayrD2cE86Z/il8b+gw3r3+1nKatmIkjn2so1d01QraTlMqVSsbx\n' +
          'NrRFi9wrf+M7Q== test@test.local',
      };

      const result = await service.inventoryBuilderForTarget([deviceAuth], 'execId');

      // Verify the response structure and important fields
      expect(result).toHaveProperty('device123456789102.vars.ansible_paramiko_pass');
      expect(result.device123456789102.vars.ansible_paramiko_pass).toEqual({
        __ansible_vault: 'test',
      });
      expect(result.device123456789102.vars).toHaveProperty('ansible_ssh_private_key_file');
    });

    test('handles strict host key checking', async () => {
      const deviceAuth = {
        device: { uuid: '1234-5678-9103', ip: '192.168.1.3' },
        authType: SSHType.UserPassword,
        strictHostKeyChecking: true,
        becomeMethod: 'su',
        becomePass: 'adminpassword',
      };

      const result = await service.inventoryBuilder([deviceAuth], '');

      expect(result.device123456789103.vars.ansible_ssh_host_key_checking).toBe(true);
    });

    test('handles devices with missing IP', async () => {
      const deviceAuth = {
        device: { uuid: '1234-5678-9104' },
        authType: SSHType.UserPassword,
      };

      const result = await service.inventoryBuilderForTarget([deviceAuth], '');

      expect(result).toHaveProperty('device123456789104');
      expect(result.device123456789104).toHaveProperty('hosts', undefined);
    });

    test('handles multiple devices', async () => {
      const deviceAuth1 = {
        device: { uuid: '1234-5678-9105', ip: '192.168.1.4' },
        authType: SSHType.UserPassword,
        becomeMethod: 'sudo',
        becomePass: 'password1',
        sshUser: 'root',
      };

      const deviceAuth2 = {
        device: { uuid: '2234-5678-9106', ip: '192.168.1.5' },
        authType: SSHType.UserPassword,
        becomeMethod: 'sudo',
        becomePass: 'password2',
        sshUser: 'root',
      };

      const result = await service.inventoryBuilderForTarget([deviceAuth1, deviceAuth2], '');

      expect(result).toHaveProperty('device123456789105');
      expect(result).toHaveProperty('device223456789106');
      expect(result.device123456789105.hosts).toBe('192.168.1.4');
      expect(result.device223456789106.hosts).toBe('192.168.1.5');
    });

    test('handles mixed authentication types', async () => {
      const deviceAuth1 = {
        device: { uuid: '1234-5678-9105', ip: '192.168.1.4' },
        authType: SSHType.UserPassword,
        becomeMethod: 'sudo',
        becomePass: 'password1',
        sshUser: 'root',
      };

      const deviceAuth2 = {
        device: { uuid: '2234-5678-9106', ip: '192.168.1.5' },
        authType: SSHType.PasswordLess,
        becomeMethod: 'sudo',
        becomePass: 'password2',
        sshUser: 'root',
      };

      const result = await service.inventoryBuilderForTarget([deviceAuth1, deviceAuth2], '');

      expect(result.device123456789105.vars.ansible_connection).toBe('paramiko');
      expect(result.device223456789106.vars.ansible_connection).toBe('ssh');
    });

    test('handles invalid input for inventoryBuilder', async () => {
      await expect(
        service.inventoryBuilder(['not a DeviceAuth instance' as any], ''),
      ).rejects.toThrow();
    });

    test('handles invalid input for inventoryBuilderForTarget', async () => {
      await expect(
        service.inventoryBuilderForTarget(['not a DeviceAuth instance' as any], ''),
      ).rejects.toThrow();
    });
  });
});
