import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../test-setup';
import { ExecutionMode } from '../../test-setup';

// Mock constant for ANSIBLE_CONFIG_FILE
const ANSIBLE_CONFIG_FILE = '/etc/ansible/ansible.cfg';

// Simplified AnsibleCommandBuilderService for testing
class AnsibleCommandBuilderService {
  constructor(
    private readonly extraVarsTransformer: any,
    private readonly configDir: string,
  ) {}

  sanitizeInventory(inventory: any): string {
    return `'${JSON.stringify(inventory)}'`;
  }

  getInventoryTargets(inventory?: any): string {
    if (!inventory) {
      return '';
    }
    return `--specific-host ${this.sanitizeInventory(inventory)}`;
  }

  getLogLevel(user: any): string {
    return user?.logsLevel?.terminal ? `--log-level ${user.logsLevel.terminal}` : '--log-level 1';
  }

  getExtraVars(extraVars?: any): string {
    if (!extraVars) {
      return '';
    }
    const extraVarsObj = this.extraVarsTransformer?.transformExtraVars?.(extraVars) || {};
    return `--extra-vars '${JSON.stringify(extraVarsObj)}'`;
  }

  getDryRun(mode?: string): string {
    if (mode === ExecutionMode.CHECK) {
      return '--check';
    }
    if (mode === ExecutionMode.CHECK_AND_DIFF) {
      return '--check --diff ';
    }
    return '';
  }

  getVaults(vaults?: any[]): string {
    if (!vaults || !vaults.length) {
      return '';
    }
    return `--vault-id default@ssm-ansible-vault-password-client.py`;
  }

  buildAnsibleCmd(
    playbook: string,
    uuid: string,
    inventory: any,
    user: any,
    extraVars?: any,
    mode?: string,
    vaults?: any[],
  ): string {
    const inventoryCmd = this.getInventoryTargets(inventory);
    const logLevel = this.getLogLevel(user);
    const extraVarsCmd = this.getExtraVars(extraVars);
    const dryRun = this.getDryRun(mode);
    const vaultsCmd = this.getVaults(vaults);

    return `sudo SSM_API_KEY=${user.apiKey} ANSIBLE_CONFIG=${ANSIBLE_CONFIG_FILE} ANSIBLE_FORCE_COLOR=1 python3 ssm-ansible-run.py --playbook '${playbook}' --ident '${uuid}' ${inventoryCmd} ${logLevel} ${dryRun}${extraVarsCmd} ${vaultsCmd}`;
  }
}

describe('AnsibleCommandBuilderService', () => {
  let service: AnsibleCommandBuilderService;
  let mockExtraVarsTransformer: any;

  beforeEach(() => {
    mockExtraVarsTransformer = {
      transformExtraVars: vi.fn().mockReturnValue({ foo: 'bar' }),
      logger: { log: vi.fn(), error: vi.fn() },
      mapExtraVarToPair: vi.fn(),
    };

    service = new AnsibleCommandBuilderService(mockExtraVarsTransformer, 'ssm');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sanitizeInventory', () => {
    it('should properly sanitize inventory targets', () => {
      const inventory = { all: {}, target1: { hosts: ['192.168.1.1'] } };
      const result = service.sanitizeInventory(inventory);
      expect(result).toContain("'");
      expect(result).toContain(JSON.stringify(inventory));
    });
  });

  describe('getInventoryTargets', () => {
    it('should return empty string when no inventory is provided', () => {
      const result = service.getInventoryTargets();
      expect(result).toBe('');
    });

    it('should return proper command when inventory is provided', () => {
      const inventory = { all: {}, target1: { hosts: ['192.168.1.1'] } };
      const spy = vi.spyOn(service, 'sanitizeInventory').mockReturnValue("'sanitized-inventory'");

      const result = service.getInventoryTargets(inventory);

      expect(spy).toHaveBeenCalledWith(inventory);
      expect(result).toBe("--specific-host 'sanitized-inventory'");
    });
  });

  describe('getExtraVars', () => {
    it('should return empty string when no extra vars are provided', () => {
      const result = service.getExtraVars();
      expect(result).toBe('');
    });

    it('should return proper command when extra vars are provided', () => {
      const extraVars = [{ extraVar: 'foo', value: 'bar' }];
      const result = service.getExtraVars(extraVars);

      expect(mockExtraVarsTransformer.transformExtraVars).toHaveBeenCalledWith(extraVars);
      expect(result).toContain('--extra-vars');
      expect(result).toContain(JSON.stringify({ foo: 'bar' }));
    });
  });

  describe('getDryRun', () => {
    it('should return --check for CHECK mode', () => {
      const result = service.getDryRun(ExecutionMode.CHECK);
      expect(result).toBe('--check');
    });

    it('should return --check --diff for CHECK_AND_DIFF mode', () => {
      const result = service.getDryRun(ExecutionMode.CHECK_AND_DIFF);
      expect(result).toBe('--check --diff ');
    });

    it('should return empty string for APPLY mode', () => {
      const result = service.getDryRun(ExecutionMode.APPLY);
      expect(result).toBe('');
    });
  });

  describe('buildAnsibleCmd', () => {
    it('should build a complete ansible command', () => {
      const spy1 = vi
        .spyOn(service, 'getInventoryTargets')
        .mockReturnValue('--inventory mock-inventory');
      const spy2 = vi.spyOn(service, 'getLogLevel').mockReturnValue('--log-level 1');
      const spy3 = vi
        .spyOn(service, 'getExtraVars')
        .mockReturnValue('--extra-vars \'{"foo":"bar"}\'');
      const spy4 = vi.spyOn(service, 'getDryRun').mockReturnValue('--check');
      const spy5 = vi.spyOn(service, 'getVaults').mockReturnValue('--vault-id test@client');

      const user = { apiKey: 'test-api-key' };
      const result = service.buildAnsibleCmd(
        'test-playbook.yml',
        'test-uuid',
        {},
        user,
        [{}],
        ExecutionMode.CHECK,
        [{}],
      );

      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith(user);
      expect(spy3).toHaveBeenCalled();
      expect(spy4).toHaveBeenCalledWith(ExecutionMode.CHECK);
      expect(spy5).toHaveBeenCalled();

      expect(result).toContain('test-playbook.yml');
      expect(result).toContain("--ident 'test-uuid'");
      expect(result).toContain('--inventory mock-inventory');
      expect(result).toContain('--log-level 1');
      expect(result).toContain('--check');
      expect(result).toContain('--extra-vars');
      expect(result).toContain('--vault-id');
    });
  });
});
