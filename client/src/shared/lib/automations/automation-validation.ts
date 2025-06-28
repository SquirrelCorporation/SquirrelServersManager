/**
 * Automation Validation Business Logic
 * Pure functions for validating automation configurations
 */

import { API, Automations } from 'ssm-shared-lib';

export interface AutomationValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CronValidationResult {
  isValid: boolean;
  error?: string;
  nextExecution?: Date;
}

/**
 * Validates automation name uniqueness
 */
export function validateAutomationName(
  name: string,
  existingAutomations: API.Automation[],
  currentAutomationUuid?: string
): AutomationValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Automation name is required');
  }

  if (name && name.trim().length < 3) {
    errors.push('Automation name must be at least 3 characters long');
  }

  if (name && name.trim().length > 50) {
    errors.push('Automation name must be less than 50 characters');
  }

  // Check for uniqueness (excluding current automation if editing)
  const nameExists = existingAutomations.some(
    automation => 
      automation.name === name && 
      automation.uuid !== currentAutomationUuid
  );

  if (nameExists) {
    errors.push('Name already exists');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a cron expression
 */
export function validateCronExpression(cronValue: string): CronValidationResult {
  if (!cronValue || cronValue.trim().length === 0) {
    return {
      isValid: false,
      error: 'Cron expression is required',
    };
  }

  const cronParts = cronValue.trim().split(/\s+/);
  
  // Basic validation for 5-part cron (minute hour day month weekday)
  if (cronParts.length !== 5) {
    return {
      isValid: false,
      error: 'Cron expression must have exactly 5 parts (minute hour day month weekday)',
    };
  }

  // Validate each part has valid characters
  const validCronChars = /^[0-9*,\-\/]+$/;
  for (const part of cronParts) {
    if (!validCronChars.test(part)) {
      return {
        isValid: false,
        error: 'Cron expression contains invalid characters',
      };
    }
  }

  // Basic range validation
  const ranges = [
    { min: 0, max: 59 }, // minute
    { min: 0, max: 23 }, // hour
    { min: 1, max: 31 }, // day
    { min: 1, max: 12 }, // month
    { min: 0, max: 7 },  // weekday (0 and 7 are Sunday)
  ];

  for (let i = 0; i < cronParts.length; i++) {
    const part = cronParts[i];
    if (part === '*') continue;
    
    // Handle comma-separated values
    const values = part.split(',');
    for (const value of values) {
      if (value.includes('-')) {
        // Range validation
        const [start, end] = value.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start < ranges[i].min || end > ranges[i].max || start > end) {
          return {
            isValid: false,
            error: `Invalid range in cron expression part ${i + 1}`,
          };
        }
      } else if (value.includes('/')) {
        // Step validation
        const [range, step] = value.split('/');
        const stepNum = Number(step);
        if (isNaN(stepNum) || stepNum <= 0) {
          return {
            isValid: false,
            error: `Invalid step value in cron expression part ${i + 1}`,
          };
        }
      } else {
        // Single value validation
        const num = Number(value);
        if (isNaN(num) || num < ranges[i].min || num > ranges[i].max) {
          return {
            isValid: false,
            error: `Value ${value} is out of range for cron expression part ${i + 1}`,
          };
        }
      }
    }
  }

  return {
    isValid: true,
  };
}

/**
 * Validates automation chain structure
 */
export function validateAutomationChain(
  chain: Automations.AutomationChain
): AutomationValidationResult {
  const errors: string[] = [];

  // Validate trigger
  if (!chain.trigger) {
    errors.push('Trigger is required');
  } else if (chain.trigger === Automations.Triggers.CRON) {
    const cronValidation = validateCronExpression(chain.cronValue);
    if (!cronValidation.isValid) {
      errors.push(`Cron validation failed: ${cronValidation.error}`);
    }
  }

  // Validate actions
  if (!chain.actions || chain.actions.length === 0) {
    errors.push('At least one action is required');
  } else {
    chain.actions.forEach((action, index) => {
      const actionErrors = validateAction(action);
      if (!actionErrors.isValid) {
        errors.push(`Action ${index + 1}: ${actionErrors.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates individual automation actions
 */
export function validateAction(
  action: Automations.ActionChain
): AutomationValidationResult {
  const errors: string[] = [];

  if (!action.action) {
    errors.push('Action type is required');
    return { isValid: false, errors };
  }

  switch (action.action) {
    case Automations.Actions.PLAYBOOK:
      const playbookAction = action as Automations.ActionChainPlaybook;
      if (!playbookAction.playbook) {
        errors.push('Playbook is required');
      }
      if (!playbookAction.actionDevices || playbookAction.actionDevices.length === 0) {
        errors.push('At least one target device is required');
      }
      break;

    case Automations.Actions.DOCKER:
      const dockerAction = action as Automations.ActionChainDocker;
      if (!dockerAction.dockerAction) {
        errors.push('Docker action is required');
      }
      if (!dockerAction.dockerContainers || dockerAction.dockerContainers.length === 0) {
        errors.push('At least one container is required');
      }
      break;

    case Automations.Actions.DOCKER_VOLUME:
      const volumeAction = action as Automations.ActionChainDockerVolume;
      if (!volumeAction.dockerVolumeAction) {
        errors.push('Docker volume action is required');
      }
      if (!volumeAction.dockerVolumes || volumeAction.dockerVolumes.length === 0) {
        errors.push('At least one volume is required');
      }
      break;

    default:
      errors.push('Unknown action type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates complete automation before submission
 */
export function validateCompleteAutomation(
  name: string,
  chain: Automations.AutomationChain,
  existingAutomations: API.Automation[],
  currentAutomationUuid?: string
): AutomationValidationResult {
  const nameValidation = validateAutomationName(name, existingAutomations, currentAutomationUuid);
  const chainValidation = validateAutomationChain(chain);

  const allErrors = [...nameValidation.errors, ...chainValidation.errors];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Checks if automation can be executed
 */
export function canExecuteAutomation(automation: API.Automation): boolean {
  return automation.enabled && automation.automationChains.actions.length > 0;
}

/**
 * Gets execution risk level based on automation configuration
 */
export function getExecutionRiskLevel(
  automation: API.Automation
): 'low' | 'medium' | 'high' {
  const { automationChains } = automation;
  
  // High risk: Volume operations, multiple containers
  if (automationChains.actions.some(action => action.action === Automations.Actions.DOCKER_VOLUME)) {
    return 'high';
  }

  // Medium risk: Docker operations, multiple devices
  if (automationChains.actions.some(action => 
    action.action === Automations.Actions.DOCKER ||
    (action.action === Automations.Actions.PLAYBOOK && action.actionDevices.length > 1)
  )) {
    return 'medium';
  }

  return 'low';
}