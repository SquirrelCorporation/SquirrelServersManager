import { SsmAnsible } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleCommandBuilderService } from '../../services/ansible-command-builder.service';

describe('AnsibleCommandBuilderService', () => {
  let service: AnsibleCommandBuilderService;
  let mockExtraVarsTransformer: any;

  beforeEach(async () => {
    mockExtraVarsTransformer = {
      transformExtraVars: vi.fn().mockReturnValue({ foo: 'bar' }),
      logger: { log: vi.fn(), error: vi.fn() },
      mapExtraVarToPair: vi.fn(),
    };

    service = new AnsibleCommandBuilderService(mockExtraVarsTransformer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sanitizeInventory', () => {
    it('should properly sanitize inventory targets', () => {
      const inventory = { all: {}, target1: { hosts: ['192.168.1.1'] } };
      const result = service.sanitizeInventory(inventory as any);
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

      const result = service.getInventoryTargets(inventory as any);

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
      const result = service.getExtraVars(extraVars as any);

      expect(mockExtraVarsTransformer.transformExtraVars).toHaveBeenCalledWith(extraVars);
      expect(result).toContain('--extra-vars');
      expect(result).toContain(JSON.stringify({ foo: 'bar' }));
    });
  });

  describe('getDryRun', () => {
    it('should return --check for CHECK mode', () => {
      const result = service.getDryRun(SsmAnsible.ExecutionMode.CHECK);
      expect(result).toBe('--check');
    });

    it('should return --check --diff for CHECK_AND_DIFF mode', () => {
      const result = service.getDryRun(SsmAnsible.ExecutionMode.CHECK_AND_DIFF);
      expect(result).toBe('--check --diff ');
    });

    it('should return empty string for APPLY mode', () => {
      const result = service.getDryRun(SsmAnsible.ExecutionMode.APPLY);
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

      const user = { apiKey: 'test-api-key' } as any;
      const result = service.buildAnsibleCmd(
        'test-playbook.yml',
        'test-uuid',
        {} as any,
        user,
        [{} as any],
        SsmAnsible.ExecutionMode.CHECK,
        [{} as any],
      );

      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith(user);
      expect(spy3).toHaveBeenCalled();
      expect(spy4).toHaveBeenCalledWith(SsmAnsible.ExecutionMode.CHECK);
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
