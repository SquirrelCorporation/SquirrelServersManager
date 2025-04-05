import { Client } from 'ssh2';

export const SSH_CONNECTION_SERVICE = 'SSH_CONNECTION_SERVICE';

export interface ISshConnectionService {
  /**
   * Create an SSH connection to a device
   * @param ssh SSH client instance
   * @param deviceUuid The device UUID to connect to
   * @returns Connection details with the host
   */
  createConnection(ssh: Client, deviceUuid: string): Promise<{ host: string }>;

  /**
   * Close an SSH connection
   * @param ssh SSH client to close
   */
  closeConnection(ssh: Client): void;

  /**
   * Fetch device details and authentication info
   * @param deviceUuid The device UUID
   * @returns Device details, authentication info, and host
   */
  fetchDeviceAndAuth(deviceUuid: string): Promise<{ 
    device: any; 
    deviceAuth: any; 
    host: string 
  }>;
}