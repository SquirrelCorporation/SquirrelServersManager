import shell from 'shelljs';
import logger from '../../logger';

export async function createDirectoryWithFullPath(fullPath: string) {
  return shell.mkdir('-p', fullPath);
}

export async function findFilesInDirectory(directory: string, pattern: RegExp) {
  return shell.find(directory).filter(function (file) {
    logger.debug(`[SHELL][UTILS] - findFilesInDirectory - checking ${file} for pattern ${pattern}`);
    return file.match(pattern);
  });
}

export async function deleteFilesAndDirectory(directory: string) {
  shell.rm('-rf', directory);
}
