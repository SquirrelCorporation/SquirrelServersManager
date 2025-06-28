/**
 * Playbook Execution Management
 * Business logic for managing playbook executions and their states
 */

import type { API } from 'ssm-shared-lib';

export type ExecutionStatus = 
  | 'pending'
  | 'running' 
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export interface ExecutionStats {
  total: number;
  successful: number;
  failed: number;
  cancelled: number;
  averageDuration: number;
  successRate: number;
}

export interface ExecutionProgress {
  totalTasks: number;
  completedTasks: number;
  currentTask: string;
  percentage: number;
  estimatedTimeRemaining?: number;
}

/**
 * Calculates execution statistics from a list of executions
 * @pure
 */
export function calculateExecutionStats(
  executions: API.PlaybookExecutionObject[]
): ExecutionStats {
  if (executions.length === 0) {
    return {
      total: 0,
      successful: 0,
      failed: 0,
      cancelled: 0,
      averageDuration: 0,
      successRate: 0,
    };
  }

  const stats = executions.reduce(
    (acc, execution) => {
      acc.total++;
      
      switch (execution.status) {
        case 'success':
          acc.successful++;
          break;
        case 'failed':
          acc.failed++;
          break;
        case 'cancelled':
          acc.cancelled++;
          break;
      }

      if (execution.duration) {
        acc.totalDuration += execution.duration;
        acc.durationCount++;
      }

      return acc;
    },
    {
      total: 0,
      successful: 0,
      failed: 0,
      cancelled: 0,
      totalDuration: 0,
      durationCount: 0,
    }
  );

  return {
    total: stats.total,
    successful: stats.successful,
    failed: stats.failed,
    cancelled: stats.cancelled,
    averageDuration: stats.durationCount > 0 
      ? Math.round(stats.totalDuration / stats.durationCount)
      : 0,
    successRate: stats.total > 0 
      ? Math.round((stats.successful / stats.total) * 100)
      : 0,
  };
}

/**
 * Determines if an execution can be cancelled
 * @pure
 */
export function canCancelExecution(
  execution: API.PlaybookExecutionObject
): boolean {
  return execution.status === 'running' || execution.status === 'pending';
}

/**
 * Determines if an execution can be retried
 * @pure
 */
export function canRetryExecution(
  execution: API.PlaybookExecutionObject
): boolean {
  return execution.status === 'failed' || 
         execution.status === 'cancelled' || 
         execution.status === 'timeout';
}

/**
 * Calculates execution progress from task information
 * @pure
 */
export function calculateExecutionProgress(
  execution: API.PlaybookExecutionObject
): ExecutionProgress {
  const totalTasks = execution.totalTasks || 0;
  const completedTasks = execution.completedTasks || 0;
  const currentTask = execution.currentTask || 'Initializing...';
  
  const percentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Estimate time remaining based on average task duration
  let estimatedTimeRemaining: number | undefined;
  if (execution.startTime && completedTasks > 0 && totalTasks > completedTasks) {
    const elapsedTime = Date.now() - new Date(execution.startTime).getTime();
    const averageTaskTime = elapsedTime / completedTasks;
    const remainingTasks = totalTasks - completedTasks;
    estimatedTimeRemaining = Math.round(averageTaskTime * remainingTasks / 1000); // in seconds
  }

  return {
    totalTasks,
    completedTasks,
    currentTask,
    percentage,
    estimatedTimeRemaining,
  };
}

/**
 * Groups executions by date for timeline display
 * @pure
 */
export function groupExecutionsByDate(
  executions: API.PlaybookExecutionObject[]
): Record<string, API.PlaybookExecutionObject[]> {
  return executions.reduce((groups, execution) => {
    const date = new Date(execution.startTime).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(execution);
    return groups;
  }, {} as Record<string, API.PlaybookExecutionObject[]>);
}

/**
 * Filters executions based on criteria
 * @pure
 */
export function filterExecutions(
  executions: API.PlaybookExecutionObject[],
  filters: {
    status?: ExecutionStatus[];
    targetDevice?: string;
    dateRange?: { start: Date; end: Date };
    search?: string;
  }
): API.PlaybookExecutionObject[] {
  return executions.filter(execution => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(execution.status as ExecutionStatus)) {
        return false;
      }
    }

    // Target device filter
    if (filters.targetDevice) {
      if (!execution.targets?.includes(filters.targetDevice)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const executionDate = new Date(execution.startTime);
      if (executionDate < filters.dateRange.start || 
          executionDate > filters.dateRange.end) {
        return false;
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesPlaybook = execution.playbookName?.toLowerCase().includes(searchLower);
      const matchesTask = execution.currentTask?.toLowerCase().includes(searchLower);
      const matchesOutput = execution.output?.toLowerCase().includes(searchLower);
      
      if (!matchesPlaybook && !matchesTask && !matchesOutput) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Determines execution status color/theme
 * @pure
 */
export function getExecutionStatusTheme(status: ExecutionStatus): {
  color: string;
  icon: string;
  text: string;
} {
  switch (status) {
    case 'pending':
      return {
        color: 'blue',
        icon: 'clock-circle',
        text: 'Pending',
      };
    case 'running':
      return {
        color: 'processing',
        icon: 'loading',
        text: 'Running',
      };
    case 'success':
      return {
        color: 'success',
        icon: 'check-circle',
        text: 'Success',
      };
    case 'failed':
      return {
        color: 'error',
        icon: 'close-circle',
        text: 'Failed',
      };
    case 'cancelled':
      return {
        color: 'warning',
        icon: 'stop',
        text: 'Cancelled',
      };
    case 'timeout':
      return {
        color: 'warning',
        icon: 'clock-circle',
        text: 'Timeout',
      };
    default:
      return {
        color: 'default',
        icon: 'question-circle',
        text: 'Unknown',
      };
  }
}

/**
 * Parses execution output to extract important information
 * @pure
 */
export function parseExecutionOutput(output: string): {
  tasks: Array<{ name: string; status: 'ok' | 'changed' | 'failed' | 'skipped' }>;
  summary: {
    ok: number;
    changed: number;
    unreachable: number;
    failed: number;
    skipped: number;
  };
  errors: string[];
} {
  const tasks: Array<{ name: string; status: 'ok' | 'changed' | 'failed' | 'skipped' }> = [];
  const errors: string[] = [];
  const summary = {
    ok: 0,
    changed: 0,
    unreachable: 0,
    failed: 0,
    skipped: 0,
  };

  // Parse Ansible output format
  const lines = output.split('\\n');
  lines.forEach(line => {
    // Task status lines
    const taskMatch = line.match(/TASK \\[(.*?)\\]/);
    if (taskMatch) {
      const taskName = taskMatch[1];
      const statusMatch = lines[lines.indexOf(line) + 1]?.match(/(ok|changed|failed|skipping):/);
      if (statusMatch) {
        tasks.push({
          name: taskName,
          status: statusMatch[1] as any,
        });
      }
    }

    // Summary lines
    const summaryMatch = line.match(/(ok|changed|unreachable|failed|skipped)=(\\d+)/g);
    if (summaryMatch) {
      summaryMatch.forEach(match => {
        const [key, value] = match.split('=');
        summary[key as keyof typeof summary] = parseInt(value, 10);
      });
    }

    // Error lines
    if (line.includes('fatal:') || line.includes('ERROR')) {
      errors.push(line);
    }
  });

  return { tasks, summary, errors };
}