import { describe, expect, test } from 'vitest';
import { SSHType } from 'ssm-shared-lib/distribution/enums/ansible';
import InventoryTransformer from '../../../integrations/ansible/transformers/InventoryTransformer'; // replace with actual file path

describe('test InventoryTransformer', () => {
  test('inventoryBuilder', () => {
    const deviceAuth = {
      device: { uuid: '1234-5678-9101', ip: '192.168.1.1' },
      authType: SSHType.UserPassword,
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
          ansible_connection: 'ssh',
          ansible_become_method: 'sudo',
          ansible_become_pass: { __ansible_vault: 'password' },
          ansible_ssh_extra_args: "'-o StrictHostKeyChecking=no'",
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
      authType: SSHType.UserPassword,
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
          ansible_connection: 'ssh',
          ansible_become_method: 'sudo',
          ansible_become_pass: { __ansible_vault: 'qwerty' },
          ansible_ssh_extra_args: "'\\''-o StrictHostKeyChecking=no'\\''",
          ansible_user: 'admin',
          ansible_ssh_pass: { __ansible_vault: undefined },
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
      authType: SSHType.UserPassword,
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
          ansible_connection: 'ssh',
          ansible_become_method: 'su',
          ansible_become_pass: { __ansible_vault: 'adminpassword' },
          ansible_ssh_extra_args: undefined,
          ansible_user: undefined,
          ansible_ssh_pass: { __ansible_vault: undefined },
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('inventoryBuilderForTarget for deviceAuth with undefined IP', () => {
    const deviceAuth = { device: { uuid: '1234-5678-9104' }, authType: SSHType.UserPassword };
    // @ts-expect-error partial type
    const result = InventoryTransformer.inventoryBuilderForTarget([deviceAuth]);
    const expectedResult = {
      all: {},
      device123456789104: {
        hosts: undefined,
        vars: {
          ansible_connection: 'ssh',
          ansible_become_method: undefined,
          ansible_become_pass: { __ansible_vault: undefined },
          ansible_ssh_extra_args: "'\\''-o StrictHostKeyChecking=no'\\''",
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
    // @ts-expect-error partial type
    const result = InventoryTransformer.inventoryBuilderForTarget([deviceAuth1, deviceAuth2]);
    const expectedResult = {
      all: {},
      device123456789105: {
        hosts: '192.168.1.4',
        vars: {
          ansible_connection: 'ssh',
          ansible_become_method: 'sudo',
          ansible_become_pass: { __ansible_vault: 'password1' },
          ansible_ssh_extra_args: "'\\''-o StrictHostKeyChecking=no'\\''",
          ansible_user: 'root',
          ansible_ssh_pass: { __ansible_vault: undefined },
        },
      },
      device223456789106: {
        hosts: '192.168.1.5',
        vars: {
          ansible_connection: 'ssh',
          ansible_become_method: 'sudo',
          ansible_become_pass: { __ansible_vault: 'password2' },
          ansible_ssh_extra_args: "'\\''-o StrictHostKeyChecking=no'\\''",
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
