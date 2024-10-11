import { API, SsmAnsible } from 'ssm-shared-lib';
import { describe, expect, test } from 'vitest';
import User from '../../../../data/database/model/User';
import { ANSIBLE_CONFIG_FILE } from '../../../../helpers/ansible/AnsibleConfigurationHelper';
import AnsibleCmd from '../../../../modules/ansible/AnsibleCmd'; // note: replace with actual file path
import type { Playbooks } from '../../../../types/typings';

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
      "sudo SSM_API_KEY=testKey ANSIBLE_CONFIG=/ansible-config/ansible.cfg ANSIBLE_FORCE_COLOR=1 python3 ssm-ansible-run.py --playbook testPlaybook --ident 'testUuid'";
    expect(result.startsWith(expectedStart)).toEqual(true);
  });

  test('should include both --check and --diff flags when mode is CHECK_AND_DIFF', () => {
    const playbook = 'testPlaybook';
    const uuid = 'testUuid';
    const result = AnsibleCmd.buildAnsibleCmd(
      playbook,
      uuid,
      inventory,
      user,
      undefined,
      SsmAnsible.ExecutionMode.CHECK_AND_DIFF,
    ).trim();

    const ansibleCmdPartsWithDiffCheck = [
      'sudo',
      `SSM_API_KEY=${user.apiKey}`,
      `ANSIBLE_CONFIG=${ANSIBLE_CONFIG_FILE}`,
      'ANSIBLE_FORCE_COLOR=1',
      'python3',
      'ssm-ansible-run.py',
      `--playbook ${playbook}`,
      `--ident '${uuid}'`,
      `--specific-host '${JSON.stringify(inventory)}'`,
      '--log-level 1',
      '--check --diff',
    ];

    const expectedCmd = ansibleCmdPartsWithDiffCheck.join(' ').trim();

    expect(result).toEqual(expectedCmd);
  });

  test('should include --check flag when mode is CHECK', () => {
    const playbook = 'testPlaybook';
    const uuid = 'testUuid';
    const result = AnsibleCmd.buildAnsibleCmd(
      playbook,
      uuid,
      inventory,
      user,
      undefined,
      SsmAnsible.ExecutionMode.CHECK,
    ).trim();

    const ansibleCmdPartsWithCheck = [
      'sudo',
      `SSM_API_KEY=${user.apiKey}`,
      `ANSIBLE_CONFIG=${ANSIBLE_CONFIG_FILE}`,
      'ANSIBLE_FORCE_COLOR=1',
      'python3',
      'ssm-ansible-run.py',
      `--playbook ${playbook}`,
      `--ident '${uuid}'`,
      `--specific-host '${JSON.stringify(inventory)}'`,
      '--log-level 1',
      '--check',
    ];

    const expectedCmd = ansibleCmdPartsWithCheck.join(' ').trim();

    expect(result).toEqual(expectedCmd);
  });

  test('should omit --check and --diff flags when mode is APPLY', () => {
    const playbook = 'testPlaybook';
    const uuid = 'testUuid';
    const result = AnsibleCmd.buildAnsibleCmd(
      playbook,
      uuid,
      inventory,
      user,
      undefined,
      SsmAnsible.ExecutionMode.APPLY,
    ).trim();

    const ansibleCmdPartsWithApply = [
      'sudo',
      `SSM_API_KEY=${user.apiKey}`,
      `ANSIBLE_CONFIG=${ANSIBLE_CONFIG_FILE}`,
      'ANSIBLE_FORCE_COLOR=1',
      'python3',
      'ssm-ansible-run.py',
      `--playbook ${playbook}`,
      `--ident '${uuid}'`,
      `--specific-host '${JSON.stringify(inventory)}'`,
      '--log-level 1',
    ];

    const expectedCmd = ansibleCmdPartsWithApply.join(' ').trim();

    expect(result).toEqual(expectedCmd);
  });
});
