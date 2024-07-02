import path from 'path';
import fs from 'fs-extra';
import { ShellString } from 'shelljs';
import logger from '../../../logger';
import shellWrapper from '../ShellWrapper';
import { AbstractShellCommander } from '../AbstractShellCommander';

export class FileSystemManager extends AbstractShellCommander {
  constructor() {
    super(logger.child({ module: 'FileSystem' }), 'FileSystem');
  }

  createDirectory(fullPath: string, rootPath?: string): ShellString {
    this.checkPath(fullPath, rootPath);
    this.isFileExists(fullPath);
    return this.executeCommand(shellWrapper.mkdir, '-p', fullPath);
  }

  deleteFiles(directory: string, rootPath?: string): void {
    this.checkPath(directory, rootPath);
    this.executeCommand(shellWrapper.rm, '-rf', directory);
  }

  protected checkPath(userPath: string, rootPath?: string) {
    if (rootPath) {
      const filePath = path.resolve(rootPath, userPath);
      if (!filePath.startsWith(rootPath)) {
        throw new Error('Attempt to manipulate a file or directory outside the root directory');
      }
    }
  }

  protected isFileExists(fullPath: string): void {
    let fileExist: string | undefined;
    try {
      fileExist = fs.realpathSync(path.resolve(fullPath));
    } catch {}
    if (fileExist) {
      throw new Error('Directory or file already exists');
    }
  }
}

export default new FileSystemManager();
