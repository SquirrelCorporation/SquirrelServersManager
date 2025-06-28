/**
 * Automation Validation Tests
 * Tests for pure automation validation business logic
 */

import {
  validateAutomationName,
  validateCronExpression,
  validateAutomationChain,
  validateAction,
  validateCompleteAutomation,
  canExecuteAutomation,
  getExecutionRiskLevel,
} from '../automation-validation';
import { API, Automations } from 'ssm-shared-lib';

describe('Automation Validation', () => {
  const mockAutomations: API.Automation[] = [
    {
      uuid: '1',
      name: 'Existing Automation',
      enabled: true,
      lastExecutionStatus: 'success',
      lastExecutionTime: new Date(),
      automationChains: {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 2 * * *',
        actions: [],
      },
    },
  ];

  describe('validateAutomationName', () => {
    it('should validate a unique name', () => {
      const result = validateAutomationName('New Automation', mockAutomations);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject duplicate names', () => {
      const result = validateAutomationName('Existing Automation', mockAutomations);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name already exists');
    });

    it('should reject empty names', () => {
      const result = validateAutomationName('', mockAutomations);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Automation name is required');
    });

    it('should reject names that are too short', () => {
      const result = validateAutomationName('AB', mockAutomations);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Automation name must be at least 3 characters long');
    });

    it('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      const result = validateAutomationName(longName, mockAutomations);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Automation name must be less than 50 characters');
    });

    it('should allow duplicate name when editing the same automation', () => {
      const result = validateAutomationName('Existing Automation', mockAutomations, '1');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateCronExpression', () => {
    it('should validate a correct cron expression', () => {
      const result = validateCronExpression('0 2 * * *');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty cron expression', () => {
      const result = validateCronExpression('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Cron expression is required');
    });

    it('should reject cron expression with wrong number of parts', () => {
      const result = validateCronExpression('0 2 * *');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Cron expression must have exactly 5 parts (minute hour day month weekday)');
    });

    it('should reject cron expression with invalid characters', () => {
      const result = validateCronExpression('0 2 * * abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Cron expression contains invalid characters');
    });

    it('should reject cron expression with out of range values', () => {
      const result = validateCronExpression('60 2 * * *'); // minute > 59
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Value 60 is out of range');
    });

    it('should validate cron expression with ranges', () => {
      const result = validateCronExpression('0-30 2 * * *');
      expect(result.isValid).toBe(true);
    });

    it('should validate cron expression with steps', () => {
      const result = validateCronExpression('*/5 * * * *');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateAction', () => {
    it('should validate a playbook action', () => {
      const action: Automations.ActionChainPlaybook = {
        action: Automations.Actions.PLAYBOOK,
        playbook: 'test-playbook',
        actionDevices: ['device1', 'device2'],
      };

      const result = validateAction(action);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject playbook action without playbook', () => {
      const action: Automations.ActionChainPlaybook = {
        action: Automations.Actions.PLAYBOOK,
        playbook: '',
        actionDevices: ['device1'],
      };

      const result = validateAction(action);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Playbook is required');
    });

    it('should reject playbook action without devices', () => {
      const action: Automations.ActionChainPlaybook = {
        action: Automations.Actions.PLAYBOOK,
        playbook: 'test-playbook',
        actionDevices: [],
      };

      const result = validateAction(action);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one target device is required');
    });

    it('should validate a docker action', () => {
      const action: Automations.ActionChainDocker = {
        action: Automations.Actions.DOCKER,
        dockerAction: 'start',
        dockerContainers: ['container1'],
      };

      const result = validateAction(action);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a docker volume action', () => {
      const action: Automations.ActionChainDockerVolume = {
        action: Automations.Actions.DOCKER_VOLUME,
        dockerVolumeAction: 'backup',
        dockerVolumes: ['volume1'],
      };

      const result = validateAction(action);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateAutomationChain', () => {
    it('should validate a complete automation chain', () => {
      const chain: Automations.AutomationChain = {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 2 * * *',
        actions: [
          {
            action: Automations.Actions.PLAYBOOK,
            playbook: 'test-playbook',
            actionDevices: ['device1'],
          },
        ],
      };

      const result = validateAutomationChain(chain);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject chain without actions', () => {
      const chain: Automations.AutomationChain = {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 2 * * *',
        actions: [],
      };

      const result = validateAutomationChain(chain);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one action is required');
    });

    it('should reject chain with invalid cron', () => {
      const chain: Automations.AutomationChain = {
        trigger: Automations.Triggers.CRON,
        cronValue: 'invalid-cron',
        actions: [
          {
            action: Automations.Actions.PLAYBOOK,
            playbook: 'test-playbook',
            actionDevices: ['device1'],
          },
        ],
      };

      const result = validateAutomationChain(chain);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Cron validation failed'))).toBe(true);
    });
  });

  describe('validateCompleteAutomation', () => {
    it('should validate a complete automation', () => {
      const chain: Automations.AutomationChain = {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 2 * * *',
        actions: [
          {
            action: Automations.Actions.PLAYBOOK,
            playbook: 'test-playbook',
            actionDevices: ['device1'],
          },
        ],
      };

      const result = validateCompleteAutomation('New Automation', chain, mockAutomations);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect all validation errors', () => {
      const chain: Automations.AutomationChain = {
        trigger: Automations.Triggers.CRON,
        cronValue: 'invalid',
        actions: [],
      };

      const result = validateCompleteAutomation('', chain, mockAutomations);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('canExecuteAutomation', () => {
    it('should return true for enabled automation with actions', () => {
      const automation: API.Automation = {
        uuid: '1',
        name: 'Test',
        enabled: true,
        lastExecutionStatus: 'success',
        lastExecutionTime: new Date(),
        automationChains: {
          trigger: Automations.Triggers.CRON,
          cronValue: '0 2 * * *',
          actions: [
            {
              action: Automations.Actions.PLAYBOOK,
              playbook: 'test',
              actionDevices: ['device1'],
            },
          ],
        },
      };

      expect(canExecuteAutomation(automation)).toBe(true);
    });

    it('should return false for disabled automation', () => {
      const automation: API.Automation = {
        uuid: '1',
        name: 'Test',
        enabled: false,
        lastExecutionStatus: 'success',
        lastExecutionTime: new Date(),
        automationChains: {
          trigger: Automations.Triggers.CRON,
          cronValue: '0 2 * * *',
          actions: [
            {
              action: Automations.Actions.PLAYBOOK,
              playbook: 'test',
              actionDevices: ['device1'],
            },
          ],
        },
      };

      expect(canExecuteAutomation(automation)).toBe(false);
    });

    it('should return false for automation without actions', () => {
      const automation: API.Automation = {
        uuid: '1',
        name: 'Test',
        enabled: true,
        lastExecutionStatus: 'success',
        lastExecutionTime: new Date(),
        automationChains: {
          trigger: Automations.Triggers.CRON,
          cronValue: '0 2 * * *',
          actions: [],
        },
      };

      expect(canExecuteAutomation(automation)).toBe(false);
    });
  });

  describe('getExecutionRiskLevel', () => {
    it('should return high risk for volume operations', () => {
      const automation: API.Automation = {
        uuid: '1',
        name: 'Test',
        enabled: true,
        lastExecutionStatus: 'success',
        lastExecutionTime: new Date(),
        automationChains: {
          trigger: Automations.Triggers.CRON,
          cronValue: '0 2 * * *',
          actions: [
            {
              action: Automations.Actions.DOCKER_VOLUME,
              dockerVolumeAction: 'backup',
              dockerVolumes: ['volume1'],
            },
          ],
        },
      };

      expect(getExecutionRiskLevel(automation)).toBe('high');
    });

    it('should return medium risk for docker operations', () => {
      const automation: API.Automation = {
        uuid: '1',
        name: 'Test',
        enabled: true,
        lastExecutionStatus: 'success',
        lastExecutionTime: new Date(),
        automationChains: {
          trigger: Automations.Triggers.CRON,
          cronValue: '0 2 * * *',
          actions: [
            {
              action: Automations.Actions.DOCKER,
              dockerAction: 'restart',
              dockerContainers: ['container1'],
            },
          ],
        },
      };

      expect(getExecutionRiskLevel(automation)).toBe('medium');
    });

    it('should return low risk for single device playbook', () => {
      const automation: API.Automation = {
        uuid: '1',
        name: 'Test',
        enabled: true,
        lastExecutionStatus: 'success',
        lastExecutionTime: new Date(),
        automationChains: {
          trigger: Automations.Triggers.CRON,
          cronValue: '0 2 * * *',
          actions: [
            {
              action: Automations.Actions.PLAYBOOK,
              playbook: 'test',
              actionDevices: ['device1'],
            },
          ],
        },
      };

      expect(getExecutionRiskLevel(automation)).toBe('low');
    });
  });
});