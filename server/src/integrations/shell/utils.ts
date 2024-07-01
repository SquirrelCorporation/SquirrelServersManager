import path from 'path';
import fs from 'fs-extra';
import shell, { ShellString } from 'shelljs';

export async function createDirectoryWithFullPath(
  fullPath: string,
  rootPath?: string,
): Promise<ShellString> {
  if (rootPath) {
    const filePath = path.resolve(rootPath, fullPath);
    if (!filePath.startsWith(rootPath)) {
      throw new Error('Attempt to create a file or directory outside the root directory');
    }
  }
  let fileExist: string | undefined;
  try {
    fileExist = fs.realpathSync(path.resolve(fullPath));
  } catch {}
  if (fileExist) {
    throw new Error('Directory or file already exists');
  }
  return shell.mkdir('-p', fullPath);
}

export async function deleteFilesAndDirectory(directory: string, rootPath?: string) {
  if (rootPath) {
    const filePath = fs.realpathSync(path.resolve(rootPath, directory));
    if (!filePath.startsWith(rootPath)) {
      throw new Error('Attempt to delete a file or directory outside the root directory');
    }
  }
  shell.rm('-rf', directory);
}

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
