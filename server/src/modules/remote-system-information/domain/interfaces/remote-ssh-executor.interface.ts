import { Client, ConnectConfig } from 'ssh2';
import { IComponent } from './component.interface';
import { RemoteExecOptions } from '../types/remote-executor.types';

/**
 * Interface for the remote SSH executor component
 * Provides methods for executing commands on remote devices via SSH
 */
export interface IRemoteSSHExecutor extends IComponent {
  /**
   * Execute a command asynchronously on the remote device
   * @param command Command to execute
   * @param options Execution options
   */
  execAsync(command: string, options?: RemoteExecOptions): Promise<string>;
  
  /**
   * Execute a command with callback on the remote device
   * @param command Command to execute
   * @param callback Callback function
   * @param options Execution options
   */
  execWithCallback(
    command: string,
    callback: (err: Error | null, result: string) => void,
    options?: RemoteExecOptions
  ): void;
  
  /**
   * Close the SSH connection
   */
  close(): void;
  
  /**
   * Static method to test an SSH connection
   * @param config SSH connection configuration
   */
  static testConnection(config: ConnectConfig): Promise<void>;
}  