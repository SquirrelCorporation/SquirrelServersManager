/**
 * Enum for update types
 */
export enum UpdateType {
  CPU = 'CPU',
  Memory = 'Memory',
  MemoryLayout = 'MemoryLayout',
  FileSystems = 'FileSystems',
  Network = 'Network',
  Graphics = 'Graphics',
  WiFi = 'WiFi',
  USB = 'USB',
  OS = 'OS',
  System = 'System',
  Versions = 'Versions',
  Bluetooth = 'Bluetooth',
}

/**
 * Enum for statistics update types
 */
export enum UpdateStatsType {
  CPU_STATS = 'CPU_Stats',
  MEM_STATS = 'Memory_Stats',
  FILE_SYSTEM_STATS = 'FileSystems_Stats',
}

/**
 * Queue job data interface
 */
export interface QueueJobData {
  deviceUuid: string;
  updateType: UpdateType | UpdateStatsType;
  data: unknown;
}