/**
 * Playbook Validation Business Logic
 * Pure functions for validating playbook configurations and executions
 */

import type { API } from 'ssm-shared-lib';

export interface PlaybookValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

/**
 * Validates a playbook configuration
 * @pure
 */
export function validatePlaybook(
  playbook: Partial<API.PlaybookObject>
): PlaybookValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!playbook.name || playbook.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Playbook name is required',
      severity: 'error',
    });
  }

  if (!playbook.path || playbook.path.trim().length === 0) {
    errors.push({
      field: 'path',
      message: 'Playbook path is required',
      severity: 'error',
    });
  }

  // Path validation
  if (playbook.path) {
    if (!playbook.path.endsWith('.yml') && !playbook.path.endsWith('.yaml')) {
      errors.push({
        field: 'path',
        message: 'Playbook must be a YAML file (.yml or .yaml)',
        severity: 'error',
      });
    }

    if (playbook.path.includes('..')) {
      errors.push({
        field: 'path',
        message: 'Path cannot contain parent directory references (..)',
        severity: 'error',
      });
    }
  }

  // Extra vars validation
  if (playbook.extraVars) {
    try {
      JSON.parse(playbook.extraVars);
    } catch (e) {
      errors.push({
        field: 'extraVars',
        message: 'Extra vars must be valid JSON',
        severity: 'error',
      });
    }
  }

  // Tags validation
  if (playbook.tags && playbook.tags.length > 10) {
    warnings.push({
      field: 'tags',
      message: 'Consider using fewer tags for better organization (recommended: max 10)',
      severity: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates playbook execution parameters
 * @pure
 */
export function validatePlaybookExecution(
  execution: Partial<API.PlaybookExecutionObject>
): PlaybookValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Target validation
  if (!execution.targets || execution.targets.length === 0) {
    errors.push({
      field: 'targets',
      message: 'At least one target device must be selected',
      severity: 'error',
    });
  }

  // Check mode validation
  if (execution.checkMode && execution.diffMode) {
    warnings.push({
      field: 'mode',
      message: 'Running in both check and diff mode may slow down execution',
      severity: 'warning',
    });
  }

  // Verbosity validation
  if (execution.verbosity && execution.verbosity > 4) {
    warnings.push({
      field: 'verbosity',
      message: 'High verbosity levels can generate excessive logs',
      severity: 'warning',
    });
  }

  // Timeout validation
  if (execution.timeout) {
    if (execution.timeout < 60) {
      errors.push({
        field: 'timeout',
        message: 'Timeout must be at least 60 seconds',
        severity: 'error',
      });
    }
    
    if (execution.timeout > 3600) {
      warnings.push({
        field: 'timeout',
        message: 'Long timeouts may cause resource issues (current: > 1 hour)',
        severity: 'warning',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a playbook template
 * @pure
 */
export function validatePlaybookTemplate(
  template: any
): PlaybookValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!template.name) {
    errors.push({
      field: 'name',
      message: 'Template name is required',
      severity: 'error',
    });
  }

  if (!template.description) {
    warnings.push({
      field: 'description',
      message: 'Consider adding a description for better documentation',
      severity: 'warning',
    });
  }

  if (!template.tasks || template.tasks.length === 0) {
    errors.push({
      field: 'tasks',
      message: 'Template must contain at least one task',
      severity: 'error',
    });
  }

  // Validate each task
  template.tasks?.forEach((task: any, index: number) => {
    if (!task.name) {
      errors.push({
        field: `tasks[${index}].name`,
        message: `Task ${index + 1} must have a name`,
        severity: 'error',
      });
    }

    if (!task.module && !task.include && !task.import_tasks) {
      errors.push({
        field: `tasks[${index}]`,
        message: `Task ${index + 1} must specify a module or include/import`,
        severity: 'error',
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates Git repository configuration for playbooks
 * @pure
 */
export function validateGitRepository(
  repo: Partial<API.GitRepositoryObject>
): PlaybookValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!repo.url) {
    errors.push({
      field: 'url',
      message: 'Repository URL is required',
      severity: 'error',
    });
  } else {
    // Basic URL validation
    try {
      new URL(repo.url);
    } catch {
      errors.push({
        field: 'url',
        message: 'Invalid repository URL format',
        severity: 'error',
      });
    }

    // Git URL validation
    if (!repo.url.endsWith('.git') && 
        !repo.url.includes('github.com') && 
        !repo.url.includes('gitlab.com') &&
        !repo.url.includes('bitbucket.org')) {
      warnings.push({
        field: 'url',
        message: 'URL does not appear to be a Git repository',
        severity: 'warning',
      });
    }
  }

  if (!repo.branch) {
    warnings.push({
      field: 'branch',
      message: 'No branch specified, will use default branch',
      severity: 'warning',
    });
  }

  if (repo.authType === 'ssh' && !repo.sshKey) {
    errors.push({
      field: 'sshKey',
      message: 'SSH key is required for SSH authentication',
      severity: 'error',
    });
  }

  if (repo.authType === 'token' && !repo.accessToken) {
    errors.push({
      field: 'accessToken',
      message: 'Access token is required for token authentication',
      severity: 'error',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}