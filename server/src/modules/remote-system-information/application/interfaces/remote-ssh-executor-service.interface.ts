import { ConnectConfig } from 'ssh2';

/**
 * Interface for the Remote SSH Executor Service
 */
export interface IRemoteSSHExecutorService {
  /**
   * Create an SSH executor for a specific device
   * @param deviceUuid The device UUID to create an executor for
   */
  createExecutorForDevice(deviceUuid: string): Promise<any>;

  /**
   * Test an SSH connection
   * @param config SSH connection configuration
   */
  testConnection(config: ConnectConfig): Promise<void>;

  /**
   * Close all SSH connections
   */
  closeAll(): Promise<void>;
}
