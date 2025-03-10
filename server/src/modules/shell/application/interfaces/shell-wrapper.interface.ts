import { ExecOptions, ShellString, TestOptions } from 'shelljs';

/**
 * Interface for shell wrapper operations in the application layer
 */
export interface IShellWrapperService {
  mkdir(options: string, path: string): ShellString;
  rm(options: string, path: string): ShellString;
  cat(path: string): ShellString;
  echo(content: string): ShellString;
  touch(path: string): ShellString;
  test(options: TestOptions, path: string): boolean;
  chmod(options: string, path: string): ShellString;
  cp(options: string, source: string, destination: string): ShellString;
  ln(options: string, source: string, destination: string): ShellString;
  to(content: string, path: string): ShellString;
  exec(command: string, options?: ExecOptions): ShellString;
}