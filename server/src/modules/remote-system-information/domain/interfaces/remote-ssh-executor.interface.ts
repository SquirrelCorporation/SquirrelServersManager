import { ConnectConfig } from 'ssh2';
import { RemoteExecOptions } from '../types/remote-executor.types';
import { IComponent } from './component.interface';

export interface IRemoteSSHExecutorConstructor {
  testConnection(config: ConnectConfig): Promise<void>;
}

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
    options?: RemoteExecOptions,
  ): void;

  /**
   * Close the SSH connection
   */
  close(): void;
}
