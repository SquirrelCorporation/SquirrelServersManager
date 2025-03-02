import { Injectable } from '@nestjs/common';
import shell from 'shelljs';

/**
 * ShellWrapperService provides a NestJS injectable wrapper around shelljs.
 * It exposes the same methods as the original ShellWrapper module for consistency.
 */
@Injectable()
export class ShellWrapperService {
  mkdir = shell.mkdir.bind(shell);
  rm = shell.rm.bind(shell);
  cat = shell.cat.bind(shell);
  echo = shell.echo.bind(shell);
  touch = shell.touch.bind(shell);
  test = shell.test.bind(shell);
  chmod = shell.chmod.bind(shell);
  cp = shell.cp.bind(shell);
  ln = shell.ln.bind(shell);
  cd = shell.cd.bind(shell);
  exec = shell.exec.bind(shell);

  /**
   * Write content to a file
   * @param content The content to write
   * @param path The path to write to
   * @returns The ShellString result
   */
  to(content: string, path: string) {
    return shell.ShellString(content).to(path);
  }
}
