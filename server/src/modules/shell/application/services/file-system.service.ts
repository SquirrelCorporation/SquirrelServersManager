import path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs-extra';
import { ShellString, TestOptions } from 'shelljs';
import { IFileSystemService } from '../interfaces/file-system.interface';
import { ShellWrapperService } from './shell-wrapper.service';

/**
 * FileSystemService provides methods for managing files and directories
 * through a NestJS injectable service.
 * It implements the IFileSystemService interface.
 */
@Injectable()
export class FileSystemService implements IFileSystemService {
  private readonly logger = new Logger(FileSystemService.name);
  private readonly shellWrapper: ShellWrapperService;

  constructor(shellWrapper: ShellWrapperService) {
    this.shellWrapper = shellWrapper;
  }

  /**
   * Creates a directory at the specified path
   * @param fullPath The path where to create the directory
   * @param rootPath Optional root path to verify the fullPath is within
   * @returns ShellString representing the result
   */
  createDirectory(fullPath: string, rootPath?: string): ShellString {
    this.checkPath(fullPath, rootPath);
    this.isFileExists(fullPath);
    return this.executeCommand(this.shellWrapper.mkdir, '-p', fullPath);
  }

  /**
   * Deletes files and directories at the specified path
   * @param directory The path to delete
   * @param rootPath Optional root path to verify the directory is within
   */
  deleteFiles(directory: string, rootPath?: string): void {
    this.checkPath(directory, rootPath);
    this.executeCommand(this.shellWrapper.rm, '-rf', directory);
  }

  /**
   * Deletes a single file
   * @param filePath The path to the file to delete
   */
  deleteFile(filePath: string): void {
    this.executeCommand(this.shellWrapper.rm, '-f', filePath);
  }

  /**
   * Writes content to a file
   * @param content The content to write
   * @param path The path where to write the content
   */
  writeFile(content: string, path: string): void {
    this.executeCommand(this.shellWrapper.to, content, path);
  }

  /**
   * Copies a file from origin to destination
   * @param origin Source file path
   * @param dest Destination file path
   * @returns ShellString representing the result
   */
  copyFile(origin: string, dest: string) {
    return this.executeCommand(this.shellWrapper.cp, origin, dest);
  }

  /**
   * Tests if a file or directory exists
   * @param options Test options
   * @param path Path to test
   * @returns Boolean result of the test
   */
  test(options: TestOptions, path: string) {
    return this.executeCommand(this.shellWrapper.test, options, path);
  }

  /**
   * Reads a file and returns its content
   * @param path Path to the file
   * @returns The content of the file as a string
   */
  readFile(path: string): string {
    return this.executeCommand(this.shellWrapper.cat, path).toString();
  }

  /**
   * Executes a shell command with error handling
   * @param shellCmd The shell command to execute
   * @param args Arguments for the command
   * @returns The result of the command
   */
  private executeCommand<T extends(...args: any[]) => any>(
    shellCmd: T,
    ...args: Parameters<T>
  ): ReturnType<T> {
    try {
      this.logger.debug(`FileSystem operation starting...`);
      return shellCmd.call(this.shellWrapper, ...args);
    } catch (error) {
      this.logger.error(`FileSystem operation failed: ${error}`);
      throw new Error(`FileSystem operation failed due to ${error}`);
    }
  }

  /**
   * Checks if a path is within the root path
   * @param userPath The path to check
   * @param rootPath The root path
   */
  private checkPath(userPath: string, rootPath?: string) {
    if (rootPath) {
      const filePath = path.resolve(rootPath, userPath);
      if (!filePath.startsWith(rootPath)) {
        throw new Error('Attempt to manipulate a file or directory outside the root directory');
      }
    }
  }

  /**
   * Checks if a file exists
   * @param fullPath The path to check
   */
  private isFileExists(fullPath: string): void {
    let fileExist: string | undefined;
    try {
      fileExist = fs.realpathSync(path.resolve(fullPath));
    } catch {}
    if (fileExist) {
      throw new Error('Directory or file already exists');
    }
  }
}
