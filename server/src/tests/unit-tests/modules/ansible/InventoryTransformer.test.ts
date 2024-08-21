import { describe, expect, test } from 'vitest';
import { SsmAnsible } from 'ssm-shared-lib';
import InventoryTransformer from '../../../../modules/ansible/utils/InventoryTransformer'; // replace with actual file path

describe('test InventoryTransformer', () => {
  test('inventoryBuilder', () => {
    const deviceAuth = {
      device: { uuid: '1234-5678-9101', ip: '192.168.1.1' },
      authType: SsmAnsible.SSHType.UserPassword,
      becomeMethod: 'sudo',
      becomePass: 'password',
      sshUser: 'root',
    };

    // @ts-expect-error partial type
    const result = InventoryTransformer.inventoryBuilder([deviceAuth]);
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

  test('inventoryBuilderForTarget', () => {
    const deviceAuth = {
      device: { uuid: '1234-5678-9102', ip: '192.168.1.2' },
      authType: SsmAnsible.SSHType.UserPassword,
      becomeMethod: 'sudo',
      becomePass: 'qwerty',
      sshUser: 'admin',
    };
    // @ts-expect-error partial type
    const result = InventoryTransformer.inventoryBuilderForTarget([deviceAuth]);
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

  test('inventoryBuilderForTargetWithSshKey', () => {
    const deviceAuth = {
      device: { uuid: '1234-5678-9102', ip: '192.168.1.2' },
      authType: SsmAnsible.SSHType.KeyBased,
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
    // @ts-expect-error partial type
    const result = InventoryTransformer.inventoryBuilderForTarget([deviceAuth]);
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
          ansible_ssh_private_key_file: '/tmp/1234-5678-9102.key',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('inventoryBuilderForTargetWithSshKeyAndKeyPhrase', () => {
    const deviceAuth = {
      device: { uuid: '1234-5678-9102', ip: '192.168.1.2' },
      authType: SsmAnsible.SSHType.KeyBased,
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
    // @ts-expect-error partial type
    const result = InventoryTransformer.inventoryBuilderForTarget([deviceAuth]);
    const expectedResult = {
      all: {},
      device123456789102: {
        hosts: '192.168.1.2',
        vars: {
          ansible_connection: 'paramiko',
          ansible_become_method: 'sudo',
          ansible_become_pass: { __ansible_vault: 'qwerty' },
          ansible_paramiko_pass: { __ansible_vault: 'test' },
          ansible_user: 'admin',
          ansible_ssh_host_key_checking: false,
          ansible_ssh_private_key_file: '/tmp/1234-5678-9102.key',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('inventoryBuilder with no devicesAuth', () => {
    const result = InventoryTransformer.inventoryBuilder([]);
    const expectedResult = {
      _meta: { hostvars: {} },
      all: { children: [] },
    };

    expect(result).toEqual(expectedResult);
  });

  test('inventoryBuilder for deviceAuth with strict host key checking', () => {
    const deviceAuth = {
      device: { uuid: '1234-5678-9103', ip: '192.168.1.3' },
      authType: SsmAnsible.SSHType.UserPassword,
      strictHostKeyChecking: true,
      becomeMethod: 'su',
      becomePass: 'adminpassword',
    };
    // @ts-expect-error partial type
    const result = InventoryTransformer.inventoryBuilder([deviceAuth]);
    const expectedResult = {
      _meta: {
        hostvars: {
          device123456789103: {
            ip: ['192.168.1.3'],
          },
        },
      },
      all: {
        children: ['device123456789103'],
      },
      device123456789103: {
        hosts: ['192.168.1.3'],
        vars: {
          ansible_connection: 'paramiko',
          ansible_become_method: 'su',
          ansible_become_pass: { __ansible_vault: 'adminpassword' },
          ansible_ssh_host_key_checking: true,
          ansible_user: undefined,
          ansible_ssh_pass: { __ansible_vault: undefined },
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('inventoryBuilderForTarget for deviceAuth with undefined IP', () => {
    const deviceAuth = {
      device: { uuid: '1234-5678-9104' },
      authType: SsmAnsible.SSHType.UserPassword,
    };
    // @ts-expect-error partial type
    const result = InventoryTransformer.inventoryBuilderForTarget([deviceAuth]);
    const expectedResult = {
      all: {},
      device123456789104: {
        hosts: undefined,
        vars: {
          ansible_connection: 'paramiko',
          ansible_become_method: undefined,
          ansible_become_pass: { __ansible_vault: undefined },
          ansible_ssh_host_key_checking: false,
          ansible_user: undefined,
          ansible_ssh_pass: { __ansible_vault: undefined },
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('inventoryBuilderForTarget with multiple devicesAuth', () => {
    const deviceAuth1 = {
      device: { uuid: '1234-5678-9105', ip: '192.168.1.4' },
      authType: SsmAnsible.SSHType.UserPassword,
      becomeMethod: 'sudo',
      becomePass: 'password1',
      sshUser: 'root',
    };

    const deviceAuth2 = {
      device: { uuid: '2234-5678-9106', ip: '192.168.1.5' },
      authType: SsmAnsible.SSHType.UserPassword,
      becomeMethod: 'sudo',
      becomePass: 'password2',
      sshUser: 'root',
    };
    // @ts-expect-error partial type
    const result = InventoryTransformer.inventoryBuilderForTarget([deviceAuth1, deviceAuth2]);
    const expectedResult = {
      all: {},
      device123456789105: {
        hosts: '192.168.1.4',
        vars: {
          ansible_connection: 'paramiko',
          ansible_become_method: 'sudo',
          ansible_become_pass: { __ansible_vault: 'password1' },
          ansible_ssh_host_key_checking: false,
          ansible_user: 'root',
          ansible_ssh_pass: { __ansible_vault: undefined },
        },
      },
      device223456789106: {
        hosts: '192.168.1.5',
        vars: {
          ansible_connection: 'paramiko',
          ansible_become_method: 'sudo',
          ansible_become_pass: { __ansible_vault: 'password2' },
          ansible_ssh_host_key_checking: false,
          ansible_user: 'root',
          ansible_ssh_pass: { __ansible_vault: undefined },
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('inventoryBuilder error handling', () => {
    expect(() => {
      // @ts-expect-error partial type
      InventoryTransformer.inventoryBuilder(['not a DeviceAuth instance']);
    }).toThrow(TypeError);
  });

  test('inventoryBuilderForTarget error handling', () => {
    expect(() => {
      // @ts-expect-error partial type
      InventoryTransformer.inventoryBuilderForTarget(['not a DeviceAuth instance']);
    }).toThrow(TypeError);
  });
});
