import { Stream } from 'node:stream';

type ExecIOTypes = 'overlapped' | 'pipe' | 'ignore' | 'inherit';

export interface RemoteExecOptions {
  stdio?: ExecIOTypes | Array<ExecIOTypes | 'ipc' | Stream | number | null | undefined> | undefined;
  maxBuffer?: number | undefined;
  encoding?: BufferEncoding | null | undefined;
  env?: NodeJS.ProcessEnv & { LANG: string };
}

export type RemoteExecutorType = (cmd: string, options?: RemoteExecOptions) => Promise<string>;
export type RemoteExecutorTypeWithCallback = (
  cmd: string,
  callback: (err: Error | null, stdout: string) => void,
  options?: RemoteExecOptions,
) => void;

export type Callback = (...values: any[]) => void;
