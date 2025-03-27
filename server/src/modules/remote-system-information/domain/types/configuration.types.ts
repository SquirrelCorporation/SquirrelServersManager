/**
 * Configuration schema for a system information component watcher
 */
export interface RemoteSystemInformationComponentConfig {
  /**
   * Whether to watch for changes to this component
   */
  watch: boolean;

  /**
   * Cron expression for scheduling updates
   */
  cron: string;
}

/**
 * Configuration schema for the remote system information engine
 */
export interface RemoteSystemInformationConfigurationSchema {
  /**
   * UUID of the device to monitor
   */
  deviceUuid: string;

  /**
   * CPU configuration
   */
  cpu: RemoteSystemInformationComponentConfig;

  /**
   * CPU statistics configuration
   */
  cpuStats: RemoteSystemInformationComponentConfig;

  /**
   * Memory configuration
   */
  mem: RemoteSystemInformationComponentConfig;

  /**
   * Memory statistics configuration
   */
  memStats: RemoteSystemInformationComponentConfig;

  /**
   * File system configuration
   */
  fileSystem: RemoteSystemInformationComponentConfig;

  /**
   * File system statistics configuration
   */
  fileSystemStats: RemoteSystemInformationComponentConfig;

  /**
   * Network interfaces configuration
   */
  networkInterfaces: RemoteSystemInformationComponentConfig;

  /**
   * Graphics configuration
   */
  graphics: RemoteSystemInformationComponentConfig;

  /**
   * USB configuration
   */
  usb: RemoteSystemInformationComponentConfig;

  /**
   * System configuration
   */
  system: RemoteSystemInformationComponentConfig;

  /**
   * WiFi configuration
   */
  wifi: RemoteSystemInformationComponentConfig;

  /**
   * OS configuration
   */
  os: RemoteSystemInformationComponentConfig;

  /**
   * Versions configuration
   */
  versions: RemoteSystemInformationComponentConfig;

  /**
   * Bluetooth configuration
   */
  bluetooth: RemoteSystemInformationComponentConfig;

  host?: string; // Optional since it's not marked as required in Joi
}
