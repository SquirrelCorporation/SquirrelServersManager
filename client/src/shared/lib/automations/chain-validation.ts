/**
 * Automation Chain Validation Business Logic
 * Pure functions for validating automation chains and action compatibility
 */

import { API, Automations } from 'ssm-shared-lib';

export interface ChainValidationContext {
  availableDevices: API.DeviceItem[];
  availableContainers: any[]; // Container type from your system
  availableVolumes: any[]; // Volume type from your system
  availablePlaybooks: any[]; // Playbook type from your system
}

export interface ChainValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ActionCompatibility {
  isCompatible: boolean;
  missingResources: string[];
  conflicts: string[];
}

/**
 * Validates an automation chain with available resources
 */
export function validateChainWithContext(
  chain: Automations.AutomationChain,
  context: ChainValidationContext
): ChainValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Validate trigger
  const triggerValidation = validateTrigger(chain);
  if (!triggerValidation.isValid) {
    errors.push(...triggerValidation.errors);
  }

  // Validate each action
  chain.actions.forEach((action, index) => {
    const actionValidation = validateActionWithContext(action, context);
    
    if (!actionValidation.isValid) {
      errors.push(`Action ${index + 1}: ${actionValidation.errors.join(', ')}`);
    }
    
    warnings.push(...actionValidation.warnings);
    suggestions.push(...actionValidation.suggestions);
  });

  // Check for logical conflicts between actions
  const conflictValidation = validateActionConflicts(chain.actions);
  warnings.push(...conflictValidation.warnings);
  errors.push(...conflictValidation.errors);

  // Performance and safety suggestions
  const safetyValidation = validateChainSafety(chain);
  warnings.push(...safetyValidation.warnings);
  suggestions.push(...safetyValidation.suggestions);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates trigger configuration
 */
function validateTrigger(chain: Automations.AutomationChain): ChainValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!chain.trigger) {
    errors.push('Trigger is required');
    return { isValid: false, errors, warnings, suggestions };
  }

  switch (chain.trigger) {
    case Automations.Triggers.CRON:
      if (!chain.cronValue) {
        errors.push('Cron expression is required');
      } else {
        const cronValidation = validateCronSafety(chain.cronValue);
        warnings.push(...cronValidation.warnings);
        suggestions.push(...cronValidation.suggestions);
      }
      break;
    default:
      errors.push('Unknown trigger type');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates cron expression for safety concerns
 */
function validateCronSafety(cronValue: string): { warnings: string[]; suggestions: string[] } {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const parts = cronValue.split(' ');
  if (parts.length !== 5) {
    return { warnings, suggestions };
  }

  const [minute, hour, day, month, weekday] = parts;

  // Check for too frequent executions
  if (minute === '*') {
    warnings.push('Automation will run every minute - this may cause system overload');
    suggestions.push('Consider using a specific minute interval (e.g., */5 for every 5 minutes)');
  }

  // Check for peak hours
  if (hour === '*' || (hour.includes(',') && hour.split(',').includes('9'))) {
    suggestions.push('Consider avoiding peak business hours (9 AM - 5 PM) for heavy operations');
  }

  // Check for daily executions without specific time
  if (hour === '*' && day === '*') {
    suggestions.push('Specify a specific hour for daily automations to avoid conflicts');
  }

  return { warnings, suggestions };
}

/**
 * Validates individual action with available resources
 */
function validateActionWithContext(
  action: Automations.ActionChain,
  context: ChainValidationContext
): ChainValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  switch (action.action) {
    case Automations.Actions.PLAYBOOK:
      const playbookValidation = validatePlaybookAction(
        action as Automations.ActionChainPlaybook,
        context
      );
      errors.push(...playbookValidation.errors);
      warnings.push(...playbookValidation.warnings);
      suggestions.push(...playbookValidation.suggestions);
      break;

    case Automations.Actions.DOCKER:
      const dockerValidation = validateDockerAction(
        action as Automations.ActionChainDocker,
        context
      );
      errors.push(...dockerValidation.errors);
      warnings.push(...dockerValidation.warnings);
      suggestions.push(...dockerValidation.suggestions);
      break;

    case Automations.Actions.DOCKER_VOLUME:
      const volumeValidation = validateVolumeAction(
        action as Automations.ActionChainDockerVolume,
        context
      );
      errors.push(...volumeValidation.errors);
      warnings.push(...volumeValidation.warnings);
      suggestions.push(...volumeValidation.suggestions);
      break;

    default:
      errors.push('Unknown action type');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates playbook action
 */
function validatePlaybookAction(
  action: Automations.ActionChainPlaybook,
  context: ChainValidationContext
): ChainValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if playbook exists
  const playbookExists = context.availablePlaybooks.some(
    pb => pb.name === action.playbook || pb.id === action.playbook
  );
  
  if (!playbookExists) {
    errors.push(`Playbook "${action.playbook}" not found`);
  }

  // Check if devices exist and are online
  action.actionDevices.forEach(deviceUuid => {
    const device = context.availableDevices.find(d => d.uuid === deviceUuid);
    if (!device) {
      errors.push(`Device ${deviceUuid} not found`);
    } else if (device.status !== 'online') {
      warnings.push(`Device ${device.hostname} is currently offline`);
    }
  });

  // Performance suggestions
  if (action.actionDevices.length > 10) {
    warnings.push('Running playbook on many devices simultaneously may impact performance');
    suggestions.push('Consider running in batches or during off-peak hours');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates docker action
 */
function validateDockerAction(
  action: Automations.ActionChainDocker,
  context: ChainValidationContext
): ChainValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if containers exist
  action.dockerContainers.forEach(containerId => {
    const container = context.availableContainers.find(c => c.id === containerId);
    if (!container) {
      errors.push(`Container ${containerId} not found`);
    } else {
      // Action-specific validations
      switch (action.dockerAction) {
        case 'start':
          if (container.status === 'running') {
            warnings.push(`Container ${container.name} is already running`);
          }
          break;
        case 'stop':
          if (container.status === 'stopped') {
            warnings.push(`Container ${container.name} is already stopped`);
          }
          break;
        case 'restart':
          suggestions.push(`Restarting ${container.name} will cause brief downtime`);
          break;
      }
    }
  });

  // Safety warnings for destructive actions
  if (['remove', 'prune'].includes(action.dockerAction)) {
    warnings.push('This action will permanently delete containers and their data');
    suggestions.push('Ensure you have backups before proceeding');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates volume action
 */
function validateVolumeAction(
  action: Automations.ActionChainDockerVolume,
  context: ChainValidationContext
): ChainValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if volumes exist
  action.dockerVolumes.forEach(volumeId => {
    const volume = context.availableVolumes.find(v => v.id === volumeId);
    if (!volume) {
      errors.push(`Volume ${volumeId} not found`);
    }
  });

  // Safety warnings for volume operations
  switch (action.dockerVolumeAction) {
    case 'backup':
      suggestions.push('Ensure sufficient disk space for backup files');
      if (action.dockerVolumes.length > 5) {
        warnings.push('Backing up many volumes simultaneously may impact system performance');
      }
      break;
    case 'restore':
      warnings.push('Volume restore will overwrite existing data');
      suggestions.push('Stop containers using these volumes before restoration');
      break;
    case 'remove':
      warnings.push('Volume removal will permanently delete all data');
      suggestions.push('Create backups before removing volumes');
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates conflicts between actions in the same chain
 */
function validateActionConflicts(actions: Automations.ActionChain[]): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for conflicting docker actions on same containers
  const dockerActions = actions.filter(
    action => action.action === Automations.Actions.DOCKER
  ) as Automations.ActionChainDocker[];

  dockerActions.forEach((action1, i) => {
    dockerActions.slice(i + 1).forEach((action2, j) => {
      const commonContainers = action1.dockerContainers.filter(c =>
        action2.dockerContainers.includes(c)
      );

      if (commonContainers.length > 0) {
        const conflicting = checkDockerActionConflict(action1.dockerAction, action2.dockerAction);
        if (conflicting) {
          warnings.push(
            `Conflicting actions on containers ${commonContainers.join(', ')}: ${action1.dockerAction} and ${action2.dockerAction}`
          );
        }
      }
    });
  });

  return { errors, warnings };
}

/**
 * Checks if two docker actions conflict
 */
function checkDockerActionConflict(action1: string, action2: string): boolean {
  const conflictMap: Record<string, string[]> = {
    'start': ['stop', 'remove'],
    'stop': ['start', 'restart'],
    'remove': ['start', 'stop', 'restart'],
    'restart': ['stop', 'remove'],
  };

  return conflictMap[action1]?.includes(action2) || false;
}

/**
 * Validates chain safety and provides recommendations
 */
function validateChainSafety(chain: Automations.AutomationChain): {
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for high-risk combinations
  const hasVolumeActions = chain.actions.some(
    action => action.action === Automations.Actions.DOCKER_VOLUME
  );
  const hasDestructiveActions = chain.actions.some(
    action => 
      action.action === Automations.Actions.DOCKER &&
      ['remove', 'prune'].includes((action as Automations.ActionChainDocker).dockerAction)
  );

  if (hasVolumeActions && hasDestructiveActions) {
    warnings.push('Chain contains both volume and destructive operations');
    suggestions.push('Consider splitting into separate automations for better safety');
  }

  // Check chain complexity
  if (chain.actions.length > 5) {
    warnings.push('Complex automation with many actions may be harder to debug');
    suggestions.push('Consider breaking into smaller, focused automations');
  }

  // Check for multiple playbook actions
  const playbookActions = chain.actions.filter(
    action => action.action === Automations.Actions.PLAYBOOK
  );
  
  if (playbookActions.length > 1) {
    suggestions.push('Multiple playbook actions can be combined into a single playbook for better performance');
  }

  return { warnings, suggestions };
}

/**
 * Gets estimated execution time for a chain
 */
export function estimateChainExecutionTime(
  chain: Automations.AutomationChain,
  context: ChainValidationContext
): { estimatedMinutes: number; factors: string[] } {
  let estimatedMinutes = 0;
  const factors: string[] = [];

  chain.actions.forEach(action => {
    switch (action.action) {
      case Automations.Actions.PLAYBOOK:
        const playbookAction = action as Automations.ActionChainPlaybook;
        estimatedMinutes += playbookAction.actionDevices.length * 2; // 2 minutes per device
        factors.push(`Playbook on ${playbookAction.actionDevices.length} devices`);
        break;
      
      case Automations.Actions.DOCKER:
        estimatedMinutes += 1; // 1 minute for docker operations
        factors.push('Docker container operations');
        break;
      
      case Automations.Actions.DOCKER_VOLUME:
        const volumeAction = action as Automations.ActionChainDockerVolume;
        estimatedMinutes += volumeAction.dockerVolumes.length * 3; // 3 minutes per volume
        factors.push(`Volume operations on ${volumeAction.dockerVolumes.length} volumes`);
        break;
    }
  });

  return {
    estimatedMinutes: Math.max(1, estimatedMinutes),
    factors,
  };
}