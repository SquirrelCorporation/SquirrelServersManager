/**
 * SSH Session Management Business Logic - Pure TypeScript Functions
 * Handles SSH session lifecycle, command validation, and session rules
 */

import { Device, SSHSession, SSHCommand } from './types';
import { canConnectToDevice, supportsSSH } from './device-connectivity';

/**
 * Maximum concurrent SSH sessions per device
 */
export const MAX_SESSIONS_PER_DEVICE = 5;

/**
 * Session timeout in milliseconds (30 minutes)
 */
export const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Maximum command length
 */
export const MAX_COMMAND_LENGTH = 1024;

/**
 * Validates if an SSH session can be created for a device
 */
export function canCreateSSHSession(device: Device, existingSessions: SSHSession[] = []): {
  canCreate: boolean;
  reason?: string;
} {
  // Check basic connectivity
  if (!canConnectToDevice(device)) {
    return { canCreate: false, reason: 'Device is not accessible' };
  }
  
  // Check SSH support
  if (!supportsSSH(device)) {
    return { canCreate: false, reason: 'Device does not support SSH connections' };
  }
  
  // Check concurrent session limit
  const deviceSessions = existingSessions.filter(
    session => session.deviceUuid === device.uuid && session.status === 'connected'
  );
  
  if (deviceSessions.length >= MAX_SESSIONS_PER_DEVICE) {
    return { 
      canCreate: false, 
      reason: `Maximum ${MAX_SESSIONS_PER_DEVICE} concurrent sessions reached` 
    };
  }
  
  return { canCreate: true };
}

/**
 * Determines if a session should be auto-disconnected due to inactivity
 */
export function shouldAutoDisconnect(session: SSHSession): boolean {
  if (session.status !== 'connected') {
    return false;
  }
  
  const lastActivity = session.lastActivity || session.startedAt;
  const inactiveTime = Date.now() - lastActivity.getTime();
  
  return inactiveTime > SESSION_TIMEOUT;
}

/**
 * Calculates session duration
 */
export function getSessionDuration(session: SSHSession): number {
  const endTime = session.status === 'disconnected' 
    ? (session.lastActivity || new Date())
    : new Date();
    
  return endTime.getTime() - session.startedAt.getTime();
}

/**
 * Formats session duration for display
 */
export function formatSessionDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${seconds}s`;
}

/**
 * Validates SSH command before execution
 */
export function validateSSHCommand(command: string): {
  isValid: boolean;
  error?: string;
} {
  // Check empty command
  if (!command || command.trim().length === 0) {
    return { isValid: false, error: 'Command cannot be empty' };
  }
  
  // Check command length
  if (command.length > MAX_COMMAND_LENGTH) {
    return { 
      isValid: false, 
      error: `Command exceeds maximum length of ${MAX_COMMAND_LENGTH} characters` 
    };
  }
  
  // Check for dangerous commands (basic safety check)
  const dangerousPatterns = [
    /rm\s+-rf\s+\/(?:\s|$)/, // rm -rf /
    /:\(\)\s*{\s*:\|:&\s*};:/, // Fork bomb
    /dd\s+if=\/dev\/zero\s+of=\//, // Overwrite disk
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return { 
        isValid: false, 
        error: 'Command contains potentially dangerous operations' 
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Determines if a command is interactive (requires user input)
 */
export function isInteractiveCommand(command: string): boolean {
  const interactiveCommands = [
    'vi', 'vim', 'nano', 'emacs', // Editors
    'top', 'htop', 'less', 'more', // Pagers
    'ssh', 'telnet', 'ftp', // Network tools
    'mysql', 'psql', 'mongo', // Database shells
    'python', 'node', 'irb', // REPLs
  ];
  
  const commandParts = command.trim().split(/\s+/);
  const baseCommand = commandParts[0];
  
  return interactiveCommands.includes(baseCommand);
}

/**
 * Sanitizes command output for display
 */
export function sanitizeOutput(output: string): string {
  // Remove ANSI escape codes
  const ansiRegex = /\x1b\[[0-9;]*m/g;
  let sanitized = output.replace(ansiRegex, '');
  
  // Remove other control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit output length to prevent UI issues
  const maxOutputLength = 100000; // 100KB
  if (sanitized.length > maxOutputLength) {
    sanitized = sanitized.substring(0, maxOutputLength) + '\n... (output truncated)';
  }
  
  return sanitized;
}

/**
 * Parses command exit code to determine success/failure
 */
export function isCommandSuccessful(exitCode: number | undefined): boolean {
  return exitCode === 0;
}

/**
 * Gets command status based on exit code
 */
export function getCommandStatus(command: SSHCommand): 'success' | 'error' | 'running' {
  if (command.exitCode === undefined) {
    return 'running';
  }
  
  return isCommandSuccessful(command.exitCode) ? 'success' : 'error';
}

/**
 * Formats command for history display
 */
export function formatCommandForHistory(command: SSHCommand): string {
  const time = command.timestamp.toLocaleTimeString();
  const status = getCommandStatus(command);
  const statusSymbol = status === 'success' ? '✓' : status === 'error' ? '✗' : '⟳';
  
  return `[${time}] ${statusSymbol} ${command.command}`;
}

/**
 * Groups commands by time period for history display
 */
export function groupCommandsByPeriod(commands: SSHCommand[]): Record<string, SSHCommand[]> {
  const groups: Record<string, SSHCommand[]> = {};
  const now = new Date();
  
  commands.forEach(command => {
    const commandDate = new Date(command.timestamp);
    let period: string;
    
    // Same day
    if (commandDate.toDateString() === now.toDateString()) {
      period = 'Today';
    } 
    // Yesterday
    else if (commandDate.toDateString() === new Date(now.getTime() - 86400000).toDateString()) {
      period = 'Yesterday';
    }
    // Within a week
    else if (now.getTime() - commandDate.getTime() < 7 * 86400000) {
      period = 'This Week';
    }
    // Older
    else {
      period = commandDate.toLocaleDateString();
    }
    
    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(command);
  });
  
  return groups;
}

/**
 * Suggests commands based on device type and current context
 */
export function getSuggestedCommands(device: Device): string[] {
  const suggestions: string[] = [];
  
  // Basic system commands
  suggestions.push(
    'pwd',
    'ls -la',
    'df -h',
    'free -m',
    'uptime'
  );
  
  // Device type specific
  if (device.type === 'linux') {
    suggestions.push(
      'systemctl status',
      'journalctl -xe',
      'netstat -tlnp',
      'ps aux | grep'
    );
  }
  
  if (device.capabilities.docker) {
    suggestions.push(
      'docker ps',
      'docker images',
      'docker stats',
      'docker logs'
    );
  }
  
  if (device.type === 'proxmox') {
    suggestions.push(
      'qm list',
      'pct list',
      'pvecm status',
      'pveversion -v'
    );
  }
  
  return suggestions;
}

/**
 * Validates session state transition
 */
export function canTransitionSessionState(
  currentStatus: SSHSession['status'],
  newStatus: SSHSession['status']
): boolean {
  const validTransitions: Record<SSHSession['status'], SSHSession['status'][]> = {
    'connecting': ['connected', 'error', 'disconnected'],
    'connected': ['disconnected', 'error'],
    'disconnected': ['connecting'],
    'error': ['connecting'],
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}