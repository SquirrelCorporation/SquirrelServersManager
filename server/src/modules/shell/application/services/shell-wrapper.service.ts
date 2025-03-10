import { Injectable } from '@nestjs/common';
import { ShellString } from 'shelljs';
import { IShellWrapperService } from '../interfaces/shell-wrapper.interface';
import { ShellWrapper } from '../../infrastructure/shell-wrapper';

/**
 * ShellWrapperService provides a NestJS injectable wrapper around shelljs.
 * It implements the IShellWrapperService interface.
 */
@Injectable()
export class ShellWrapperService implements IShellWrapperService {
  mkdir = ShellWrapper.mkdir;
  rm = ShellWrapper.rm;
  cat = ShellWrapper.cat;
  echo = ShellWrapper.echo;
  touch = ShellWrapper.touch;
  test = ShellWrapper.test;
  chmod = ShellWrapper.chmod;
  cp = ShellWrapper.cp;
  ln = ShellWrapper.ln;
  exec = ShellWrapper.exec;

  /**
   * Write content to a file
   * @param content The content to write
   * @param path The path to write to
   * @returns The ShellString result
   */
  to(content: string, path: string): ShellString {
    return ShellWrapper.to(content, path);
  }
}
