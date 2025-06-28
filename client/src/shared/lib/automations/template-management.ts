/**
 * Template Management Business Logic
 * Pure functions for handling automation templates
 */

import { Automations } from 'ssm-shared-lib';

export interface AutomationTemplate {
  id: number;
  name: string;
  description: string;
  category: 'maintenance' | 'monitoring' | 'backup' | 'deployment' | 'security';
  icon: string;
  chain: Automations.AutomationChain;
  variables?: TemplateVariable[];
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  description?: string;
}

export interface TemplateFormData {
  name: string;
  description?: string;
  variables: Record<string, any>;
}

/**
 * Gets template categories with their display information
 */
export function getTemplateCategories(): Array<{
  key: string;
  label: string;
  icon: string;
  description: string;
}> {
  return [
    {
      key: 'maintenance',
      label: 'Maintenance',
      icon: 'tool',
      description: 'System maintenance and cleanup tasks',
    },
    {
      key: 'monitoring',
      label: 'Monitoring',
      icon: 'eye',
      description: 'Health checks and monitoring automations',
    },
    {
      key: 'backup',
      label: 'Backup',
      icon: 'save',
      description: 'Data backup and recovery automations',
    },
    {
      key: 'deployment',
      label: 'Deployment',
      icon: 'rocket',
      description: 'Application deployment and updates',
    },
    {
      key: 'security',
      label: 'Security',
      icon: 'shield',
      description: 'Security scans and compliance checks',
    },
  ];
}

/**
 * Filters templates by category
 */
export function filterTemplatesByCategory(
  templates: AutomationTemplate[],
  category?: string
): AutomationTemplate[] {
  if (!category) return templates;
  return templates.filter(template => template.category === category);
}

/**
 * Searches templates by name or description
 */
export function searchTemplates(
  templates: AutomationTemplate[],
  searchTerm: string
): AutomationTemplate[] {
  if (!searchTerm.trim()) return templates;
  
  const term = searchTerm.toLowerCase();
  return templates.filter(template =>
    template.name.toLowerCase().includes(term) ||
    template.description.toLowerCase().includes(term)
  );
}

/**
 * Safely transforms template chain with user-provided variables
 * Uses deep object traversal instead of string replacement to prevent injection
 */
export function transformTemplateChain(
  template: AutomationTemplate,
  variables: Record<string, any>
): Automations.AutomationChain {
  // Deep clone the chain to avoid mutation
  const chain = structuredClone(template.chain);
  
  // Replace template variables safely using object traversal
  if (template.variables && template.variables.length > 0) {
    const variableMap = new Map<string, any>();
    
    // Build validated variable map
    template.variables.forEach(variable => {
      const value = variables[variable.key] ?? variable.defaultValue;
      if (value !== undefined) {
        // Validate value type matches expected type
        if (isValidVariableValue(value, variable.type)) {
          variableMap.set(`{{${variable.key}}}`, value);
        }
      }
    });
    
    // Safely replace variables in chain using recursive traversal
    return replaceVariablesInObject(chain, variableMap) as Automations.AutomationChain;
  }
  
  return chain;
}

/**
 * Validates that a variable value matches the expected type
 */
function isValidVariableValue(value: any, expectedType: TemplateVariable['type']): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'select':
      return typeof value === 'string' || typeof value === 'number';
    default:
      return false;
  }
}

/**
 * Recursively replaces variables in an object structure
 */
function replaceVariablesInObject(obj: any, variableMap: Map<string, any>): any {
  if (typeof obj === 'string') {
    // Replace variable placeholders in strings
    let result = obj;
    for (const [placeholder, value] of variableMap) {
      if (result.includes(placeholder)) {
        // Ensure safe string replacement
        result = result.replace(new RegExp(escapeRegExp(placeholder), 'g'), String(value));
      }
    }
    return result;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => replaceVariablesInObject(item, variableMap));
  }
  
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceVariablesInObject(value, variableMap);
    }
    return result;
  }
  
  return obj;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates template form data
 */
export function validateTemplateFormData(
  template: AutomationTemplate,
  formData: TemplateFormData
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate name
  if (!formData.name || formData.name.trim().length === 0) {
    errors.push('Automation name is required');
  }
  
  if (formData.name && formData.name.trim().length < 3) {
    errors.push('Automation name must be at least 3 characters long');
  }
  
  // Validate required template variables
  if (template.variables) {
    template.variables.forEach(variable => {
      if (variable.required && !formData.variables[variable.key]) {
        errors.push(`${variable.label} is required`);
      }
      
      // Type validation
      if (formData.variables[variable.key] !== undefined) {
        const value = formData.variables[variable.key];
        
        switch (variable.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`${variable.label} must be a valid number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${variable.label} must be a boolean value`);
            }
            break;
          case 'select':
            if (variable.options && !variable.options.some(opt => opt.value === value)) {
              errors.push(`${variable.label} must be one of the provided options`);
            }
            break;
        }
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets template variable default values
 */
export function getTemplateDefaultValues(template: AutomationTemplate): Record<string, any> {
  const defaults: Record<string, any> = {};
  
  if (template.variables) {
    template.variables.forEach(variable => {
      if (variable.defaultValue !== undefined) {
        defaults[variable.key] = variable.defaultValue;
      }
    });
  }
  
  return defaults;
}

/**
 * Checks if template is compatible with current system
 */
export function isTemplateCompatible(
  template: AutomationTemplate,
  availableActions: Automations.Actions[]
): boolean {
  return template.chain.actions.every(action =>
    availableActions.includes(action.action)
  );
}

/**
 * Gets template complexity score (1-5)
 */
export function getTemplateComplexity(template: AutomationTemplate): number {
  let complexity = 1;
  
  // Base complexity from number of actions
  complexity += template.chain.actions.length - 1;
  
  // Additional complexity from action types
  template.chain.actions.forEach(action => {
    switch (action.action) {
      case Automations.Actions.DOCKER_VOLUME:
        complexity += 2; // Volume operations are risky
        break;
      case Automations.Actions.DOCKER:
        complexity += 1;
        break;
      case Automations.Actions.PLAYBOOK:
        complexity += action.actionDevices?.length > 1 ? 1 : 0;
        break;
    }
  });
  
  // Complexity from variables
  if (template.variables && template.variables.length > 3) {
    complexity += 1;
  }
  
  return Math.min(5, complexity);
}

/**
 * Groups templates by category for display
 */
export function groupTemplatesByCategory(
  templates: AutomationTemplate[]
): Record<string, AutomationTemplate[]> {
  return templates.reduce((groups, template) => {
    const category = template.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(template);
    return groups;
  }, {} as Record<string, AutomationTemplate[]>);
}

/**
 * Sorts templates by relevance (name match, then description match)
 */
export function sortTemplatesByRelevance(
  templates: AutomationTemplate[],
  searchTerm?: string
): AutomationTemplate[] {
  if (!searchTerm) {
    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  const term = searchTerm.toLowerCase();
  
  return templates.sort((a, b) => {
    const aNameMatch = a.name.toLowerCase().includes(term);
    const bNameMatch = b.name.toLowerCase().includes(term);
    
    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    
    return a.name.localeCompare(b.name);
  });
}