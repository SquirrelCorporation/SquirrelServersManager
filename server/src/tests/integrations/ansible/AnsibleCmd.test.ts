import { API } from 'ssm-shared-lib';
import { describe, expect, test } from 'vitest';
import User from '../../../data/database/model/User';
import type { Playbooks } from '../../../types/typings';
import AnsibleCmd from '../../../integrations/ansible/AnsibleCmd'; // note: replace with actual file path

describe('helper functions', () => {
  // sanitizing inventory
  test('sanitizeInventory should sanitize host data', () => {
    // @ts-expect-error partial type
    const inventory = {
      all: {
        example_group: {
          hosts: ['host1\\example', 'host2\\example'],
        },
      },
    } as Playbooks.All & Playbooks.HostGroups;
    const result = AnsibleCmd.sanitizeInventory(inventory);
    const expectedResult =
      '\'{"all":{"example_group":{"hosts":["host1\\example","host2\\example"]}}}\'';
    expect(result).toEqual(expectedResult);
  });

  test('sanitizeInventory handles empty inventory', () => {
    const inventory = {} as Playbooks.All & Playbooks.HostGroups;
    const result = AnsibleCmd.sanitizeInventory(inventory);
    const expectedResult = "'{}'";
    expect(result).toEqual(expectedResult);
  });

  // getting inventory targets
  test('getInventoryTargets should get correct string with targets', () => {
    // @ts-expect-error partial type
    const inventory = {
      all: { hosts: ['testhost1', 'testhost2'] },
    } as Playbooks.All & Playbooks.HostGroups;
    const result = AnsibleCmd.getInventoryTargets(inventory);
    expect(result).toEqual(`--specific-host ${AnsibleCmd.sanitizeInventory(inventory)}`);
  });

  test('getInventoryTargets handles empty targets', () => {
    const inventory = {} as Playbooks.All & Playbooks.HostGroups;
    const result = AnsibleCmd.getInventoryTargets(inventory);
    expect(result).toEqual("--specific-host '{}'");
  });

  // getting log level
  test('getLogLevel returns default log level if not set in user object', () => {
    const user = {} as User;
    const result = AnsibleCmd.getLogLevel(user);
    expect(result).toEqual('--log-level 1');
  });

  test('getLogLevel handles user with set log level', () => {
    const user: User = { logsLevel: { terminal: 3 } } as User;
    const result = AnsibleCmd.getLogLevel(user);
    expect(result).toEqual('--log-level 3');
  });

  // getting extra vars
  test('getExtraVars returns correct string if extraVars defined', () => {
    const extraVars: API.ExtraVars = [{ extraVar: 'testVar', value: 'testValue' }];
    const result = AnsibleCmd.getExtraVars(extraVars);
    expect(result).toEqual('--extra-vars \'{"testVar":"testValue"}\'');
  });

  test('getExtraVars return empty string if extraVars not defined', () => {
    const result = AnsibleCmd.getExtraVars(undefined);
    expect(result).toEqual('');
  });
});

describe('buildAnsibleCmd() function', () => {
  const user: User = {
    apiKey: 'testKey',
    logsLevel: {
      terminal: 1,
    },
  } as User;
  // @ts-expect-error partial type
  const inventory = {
    all: {
      example_group: {
        hosts: ['host1', 'host2'],
      },
    },
  } as Playbooks.All & Playbooks.HostGroups;

  const extraVars: API.ExtraVars = [
    {
      extraVar: 'flavor',
      value: 'api',
    },
  ];

  test('returns the correct Ansible command', () => {
    const playbook = 'testPlaybook';
    const uuid = 'testUuid';

    const result = AnsibleCmd.buildAnsibleCmd(playbook, uuid, inventory, user, extraVars);
    const expectedStart =
      "sudo SSM_API_KEY=testKey python3 ssm-ansible-run.py --playbook testPlaybook --ident 'testUuid'";
    expect(result.startsWith(expectedStart)).toEqual(true);
  });

  test('should exclude inventory targets when not provided', () => {
    const playbook = 'testPlaybook';
    const uuid = 'testUuid';
    // @ts-expect-error partial type
    const result = AnsibleCmd.buildAnsibleCmd(playbook, uuid, {}, user, extraVars);

    const ansibleCmdPartsWithoutInventory = [
      'sudo',
      `SSM_API_KEY=${user.apiKey}`,
      'python3',
      'ssm-ansible-run.py',
      `--playbook ${playbook}`,
      `--ident '${uuid}'`,
      "--specific-host '{}'",
      '--log-level 1',
      `${AnsibleCmd.getExtraVars(extraVars)}`,
    ];

    const expectedCmd = ansibleCmdPartsWithoutInventory.join(' ');

    expect(result).toEqual(expectedCmd);
  });

  test('should include extra vars when not provided', () => {
    const playbook = 'testPlaybook';
    const uuid = 'testUuid';
    const result = AnsibleCmd.buildAnsibleCmd(playbook, uuid, inventory, user).trim();

    const ansibleCmdPartsWithoutExtraVars = [
      'sudo',
      `SSM_API_KEY=${user.apiKey}`,
      'python3',
      'ssm-ansible-run.py',
      `--playbook ${playbook}`,
      `--ident '${uuid}'`,
      `--specific-host '${JSON.stringify(inventory)}'`,
      '--log-level 1',
    ];

    const expectedCmd = ansibleCmdPartsWithoutExtraVars.join(' ').trim();

    expect(result).toEqual(expectedCmd);
  });
});
