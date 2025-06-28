/**
 * Template Management Tests
 * Tests for template management business logic
 */

import {
  getTemplateCategories,
  filterTemplatesByCategory,
  searchTemplates,
  transformTemplateChain,
  validateTemplateFormData,
  getTemplateDefaultValues,
  isTemplateCompatible,
  getTemplateComplexity,
  groupTemplatesByCategory,
  sortTemplatesByRelevance,
} from '../template-management';
import { Automations } from 'ssm-shared-lib';
import type { AutomationTemplate, TemplateFormData } from '../template-management';

describe('Template Management', () => {
  const mockTemplate: AutomationTemplate = {
    id: 1,
    name: 'Daily Backup',
    description: 'Automated daily backup routine',
    category: 'backup',
    icon: 'save',
    chain: {
      trigger: Automations.Triggers.CRON,
      cronValue: '{{schedule}}',
      actions: [
        {
          action: Automations.Actions.DOCKER_VOLUME,
          dockerVolumeAction: 'backup',
          dockerVolumes: ['{{volumeName}}'],
        },
      ],
    },
    variables: [
      {
        key: 'schedule',
        label: 'Schedule',
        type: 'string',
        required: true,
        defaultValue: '0 2 * * *',
        description: 'Cron expression for backup schedule',
      },
      {
        key: 'volumeName',
        label: 'Volume Name',
        type: 'string',
        required: true,
        description: 'Name of the volume to backup',
      },
      {
        key: 'enabled',
        label: 'Enable Notifications',
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    ],
  };

  const mockTemplates: AutomationTemplate[] = [
    mockTemplate,
    {
      id: 2,
      name: 'System Monitoring',
      description: 'Monitor system health',
      category: 'monitoring',
      icon: 'eye',
      chain: {
        trigger: Automations.Triggers.CRON,
        cronValue: '*/5 * * * *',
        actions: [
          {
            action: Automations.Actions.PLAYBOOK,
            playbook: 'health-check',
            actionDevices: ['all'],
          },
        ],
      },
    },
    {
      id: 3,
      name: 'Security Scan',
      description: 'Automated security scanning',
      category: 'security',
      icon: 'shield',
      chain: {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 0 * * 0',
        actions: [
          {
            action: Automations.Actions.PLAYBOOK,
            playbook: 'security-scan',
            actionDevices: ['all'],
          },
        ],
      },
    },
  ];

  describe('getTemplateCategories', () => {
    it('should return all template categories', () => {
      const categories = getTemplateCategories();
      expect(categories).toHaveLength(5);
      expect(categories.find(c => c.key === 'backup')).toBeDefined();
      expect(categories.find(c => c.key === 'monitoring')).toBeDefined();
      expect(categories.find(c => c.key === 'security')).toBeDefined();
    });

    it('should include category metadata', () => {
      const categories = getTemplateCategories();
      const backup = categories.find(c => c.key === 'backup');
      expect(backup).toEqual({
        key: 'backup',
        label: 'Backup',
        icon: 'save',
        description: 'Data backup and recovery automations',
      });
    });
  });

  describe('filterTemplatesByCategory', () => {
    it('should return all templates when no category is specified', () => {
      const result = filterTemplatesByCategory(mockTemplates);
      expect(result).toHaveLength(3);
    });

    it('should filter templates by category', () => {
      const result = filterTemplatesByCategory(mockTemplates, 'backup');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('backup');
    });

    it('should return empty array for non-existent category', () => {
      const result = filterTemplatesByCategory(mockTemplates, 'non-existent');
      expect(result).toHaveLength(0);
    });
  });

  describe('searchTemplates', () => {
    it('should return all templates when search term is empty', () => {
      const result = searchTemplates(mockTemplates, '');
      expect(result).toHaveLength(3);
    });

    it('should search by template name', () => {
      const result = searchTemplates(mockTemplates, 'backup');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Daily Backup');
    });

    it('should search by template description', () => {
      const result = searchTemplates(mockTemplates, 'health');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('System Monitoring');
    });

    it('should be case insensitive', () => {
      const result = searchTemplates(mockTemplates, 'BACKUP');
      expect(result).toHaveLength(1);
    });
  });

  describe('transformTemplateChain', () => {
    it('should replace template variables', () => {
      const variables = {
        schedule: '0 3 * * *',
        volumeName: 'my-volume',
        enabled: false,
      };

      const result = transformTemplateChain(mockTemplate, variables);
      
      expect(result.cronValue).toBe('0 3 * * *');
      expect(result.actions[0].dockerVolumes).toEqual(['my-volume']);
    });

    it('should use default values for missing variables', () => {
      const variables = {
        volumeName: 'my-volume',
      };

      const result = transformTemplateChain(mockTemplate, variables);
      
      expect(result.cronValue).toBe('0 2 * * *'); // default value
    });

    it('should handle templates without variables', () => {
      const templateWithoutVars = { ...mockTemplate, variables: undefined };
      const result = transformTemplateChain(templateWithoutVars, {});
      
      expect(result).toEqual(templateWithoutVars.chain);
    });

    it('should handle malformed variable replacement gracefully', () => {
      const templateWithBadVars = {
        ...mockTemplate,
        chain: {
          ...mockTemplate.chain,
          cronValue: '{{unclosed',
        },
      };

      const result = transformTemplateChain(templateWithBadVars, {});
      expect(result).toBeDefined();
    });
  });

  describe('validateTemplateFormData', () => {
    const validFormData: TemplateFormData = {
      name: 'My Backup Automation',
      description: 'Custom backup',
      variables: {
        schedule: '0 3 * * *',
        volumeName: 'my-volume',
        enabled: true,
      },
    };

    it('should validate correct form data', () => {
      const result = validateTemplateFormData(mockTemplate, validFormData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty automation name', () => {
      const formData = { ...validFormData, name: '' };
      const result = validateTemplateFormData(mockTemplate, formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Automation name is required');
    });

    it('should reject short automation name', () => {
      const formData = { ...validFormData, name: 'AB' };
      const result = validateTemplateFormData(mockTemplate, formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Automation name must be at least 3 characters long');
    });

    it('should reject missing required variables', () => {
      const formData = {
        ...validFormData,
        variables: { enabled: true }, // missing required variables
      };
      const result = validateTemplateFormData(mockTemplate, formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Schedule is required');
      expect(result.errors).toContain('Volume Name is required');
    });

    it('should validate variable types', () => {
      const formData = {
        ...validFormData,
        variables: {
          ...validFormData.variables,
          enabled: 'not-a-boolean', // wrong type
        },
      };
      const result = validateTemplateFormData(mockTemplate, formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Enable Notifications must be a boolean value');
    });

    it('should validate select options', () => {
      const templateWithSelect = {
        ...mockTemplate,
        variables: [
          {
            key: 'priority',
            label: 'Priority',
            type: 'select' as const,
            required: true,
            options: [
              { label: 'Low', value: 'low' },
              { label: 'High', value: 'high' },
            ],
          },
        ],
      };

      const formData = {
        ...validFormData,
        variables: { priority: 'invalid' },
      };

      const result = validateTemplateFormData(templateWithSelect, formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Priority must be one of the provided options');
    });
  });

  describe('getTemplateDefaultValues', () => {
    it('should extract default values from template variables', () => {
      const defaults = getTemplateDefaultValues(mockTemplate);
      expect(defaults).toEqual({
        schedule: '0 2 * * *',
        enabled: true,
      });
    });

    it('should return empty object for template without variables', () => {
      const templateWithoutVars = { ...mockTemplate, variables: undefined };
      const defaults = getTemplateDefaultValues(templateWithoutVars);
      expect(defaults).toEqual({});
    });
  });

  describe('isTemplateCompatible', () => {
    it('should return true for compatible template', () => {
      const availableActions = [
        Automations.Actions.PLAYBOOK,
        Automations.Actions.DOCKER,
        Automations.Actions.DOCKER_VOLUME,
      ];
      
      const result = isTemplateCompatible(mockTemplate, availableActions);
      expect(result).toBe(true);
    });

    it('should return false for incompatible template', () => {
      const availableActions = [Automations.Actions.PLAYBOOK];
      
      const result = isTemplateCompatible(mockTemplate, availableActions);
      expect(result).toBe(false);
    });
  });

  describe('getTemplateComplexity', () => {
    it('should calculate complexity based on actions', () => {
      const complexity = getTemplateComplexity(mockTemplate);
      expect(complexity).toBeGreaterThanOrEqual(1);
      expect(complexity).toBeLessThanOrEqual(5);
    });

    it('should increase complexity for volume operations', () => {
      const simpleTemplate = {
        ...mockTemplate,
        chain: {
          ...mockTemplate.chain,
          actions: [
            {
              action: Automations.Actions.PLAYBOOK,
              playbook: 'simple',
              actionDevices: ['device1'],
            },
          ],
        },
      };

      const volumeTemplate = {
        ...mockTemplate,
        chain: {
          ...mockTemplate.chain,
          actions: [
            {
              action: Automations.Actions.DOCKER_VOLUME,
              dockerVolumeAction: 'backup',
              dockerVolumes: ['volume1'],
            },
          ],
        },
      };

      const simpleComplexity = getTemplateComplexity(simpleTemplate);
      const volumeComplexity = getTemplateComplexity(volumeTemplate);
      
      expect(volumeComplexity).toBeGreaterThan(simpleComplexity);
    });

    it('should cap complexity at 5', () => {
      const complexTemplate = {
        ...mockTemplate,
        chain: {
          ...mockTemplate.chain,
          actions: Array(10).fill({
            action: Automations.Actions.DOCKER_VOLUME,
            dockerVolumeAction: 'backup',
            dockerVolumes: ['volume1'],
          }),
        },
        variables: Array(10).fill({
          key: 'var',
          label: 'Variable',
          type: 'string',
          required: true,
        }),
      };

      const complexity = getTemplateComplexity(complexTemplate);
      expect(complexity).toBe(5);
    });
  });

  describe('groupTemplatesByCategory', () => {
    it('should group templates by category', () => {
      const grouped = groupTemplatesByCategory(mockTemplates);
      
      expect(grouped.backup).toHaveLength(1);
      expect(grouped.monitoring).toHaveLength(1);
      expect(grouped.security).toHaveLength(1);
    });

    it('should handle empty template array', () => {
      const grouped = groupTemplatesByCategory([]);
      expect(grouped).toEqual({});
    });
  });

  describe('sortTemplatesByRelevance', () => {
    it('should sort by name when no search term', () => {
      const sorted = sortTemplatesByRelevance(mockTemplates);
      expect(sorted[0].name).toBe('Daily Backup');
      expect(sorted[1].name).toBe('Security Scan');
      expect(sorted[2].name).toBe('System Monitoring');
    });

    it('should prioritize name matches over description matches', () => {
      const templates = [
        {
          id: 1,
          name: 'System Health',
          description: 'Backup system data',
          category: 'monitoring' as const,
          icon: 'eye',
          chain: mockTemplate.chain,
        },
        {
          id: 2,
          name: 'Backup Service',
          description: 'Service monitoring',
          category: 'backup' as const,
          icon: 'save',
          chain: mockTemplate.chain,
        },
      ];

      const sorted = sortTemplatesByRelevance(templates, 'backup');
      expect(sorted[0].name).toBe('Backup Service'); // name match first
      expect(sorted[1].name).toBe('System Health'); // description match second
    });
  });
});