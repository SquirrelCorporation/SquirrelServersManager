import { ShellString, TestOptions } from 'shelljs';

/**
 * Interface for file system operations in the application layer
 */
export interface IFileSystemService {
  createDirectory(fullPath: string, rootPath?: string): ShellString;
  deleteFiles(directory: string, rootPath?: string): void;
  deleteFile(filePath: string): void;
  writeFile(content: string, path: string): void;
  copyFile(origin: string, dest: string): void;
  test(options: TestOptions, path: string): boolean;
  readFile(path: string): string;
}