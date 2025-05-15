import { Stream } from 'node:stream';

/**
 * Type of execution IO
 */
type ExecIOTypes = 'overlapped' | 'pipe' | 'ignore' | 'inherit';

/**
 * Options for remote command execution
 */
export interface RemoteExecOptions {
  stdio?: ExecIOTypes | Array<ExecIOTypes | 'ipc' | Stream | number | null | undefined> | undefined;
  maxBuffer?: number | undefined;
  encoding?: BufferEncoding | null | undefined;
  env?: NodeJS.ProcessEnv & { LANG: string };
  elevatePrivilege?: boolean;
}

/**
 * Type for asynchronous remote executor function
 */
export type RemoteExecutorType = (cmd: string, options?: RemoteExecOptions) => Promise<string>;

/**
 * Type for callback-based remote executor function
 */
export type RemoteExecutorTypeWithCallback = (
  cmd: string,
  callback: (err: Error | null, stdout: string) => void,
  options?: RemoteExecOptions,
) => void;

/**
 * Generic callback type
 */
export type Callback = (...values: any[]) => void;

/**
 * Debug callback for command execution
 * @param command The command being executed
 * @param response The response from the command
 * @param success Whether the command executed successfully
 */
export type DebugCallback = (command: string, response: string, success: boolean) => void;