/**
 * Device Domain Types
 * Shared type definitions for device-related business logic
 */

export interface Device {
  uuid: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning' | 'unknown';
  type: 'linux' | 'docker' | 'proxmox';
  authType: 'password' | 'key' | 'agent';
  lastSeen?: Date;
  version?: string;
  capabilities: DeviceCapabilities;
  stats?: DeviceStats;
  services?: DeviceService[];
}

export interface DeviceCapabilities {
  docker: boolean;
  proxmox: boolean;
  containers: boolean;
  monitoring: boolean;
  ssh: boolean;
  ansible: boolean;
}

export interface DeviceStats {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  load: number[];
}

export interface DeviceService {
  name: string;
  status: 'running' | 'stopped' | 'failed';
  port?: number;
}

export interface DeviceFilters {
  search?: string;
  status?: Device['status'][];
  type?: Device['type'][];
  capabilities?: (keyof DeviceCapabilities)[];
  hasContainers?: boolean;
}

export interface DeviceConfig {
  name: string;
  ip: string;
  type: Device['type'];
  authType: Device['authType'];
  username?: string;
  password?: string;
  privateKey?: string;
  port?: number;
}

export interface SSHSession {
  id: string;
  deviceUuid: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  startedAt: Date;
  lastActivity?: Date;
  error?: string;
}

export interface SSHCommand {
  command: string;
  timestamp: Date;
  output?: string;
  error?: string;
  exitCode?: number;
}