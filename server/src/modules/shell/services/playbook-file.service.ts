import { Injectable, Logger } from '@nestjs/common';
import { ShellWrapperService } from './shell-wrapper.service';

/**
 * PlaybookFileService provides methods for managing playbook files
 * through a NestJS injectable service.
 */
@Injectable()
export class PlaybookFileService {
  private readonly logger = new Logger(PlaybookFileService.name);

  constructor(private readonly shellWrapper: ShellWrapperService) {}

  /**
   * Reads a playbook file
   * @param path Path to the playbook file
   * @returns The content of the playbook file
   */
  readPlaybook(path: string): string {
    try {
      this.logger.debug(`readPlaybook - Reading from ${path}`);
      return this.shellWrapper.cat(path).toString();
    } catch (error) {
      this.logger.error(`readPlaybook failed: ${error}`);
      throw new Error(`Reading playbook failed due to ${error}`);
    }
  }

  /**
   * Edits a playbook file
   * @param content The new content
   * @param path Path to the playbook file
   */
  editPlaybook(content: string, path: string): void {
    try {
      this.logger.debug(`editPlaybook - Writing to ${path}`);
      this.shellWrapper.to(content, path);
    } catch (error) {
      this.logger.error(`editPlaybook failed: ${error}`);
      throw new Error(`Editing playbook failed due to ${error}`);
    }
  }

  /**
   * Creates a new playbook file
   * @param path Path for the new playbook file
   */
  newPlaybook(path: string): void {
    try {
      this.logger.debug(`newPlaybook - Creating at ${path}`);
      this.shellWrapper.touch(path);
    } catch (error) {
      this.logger.error(`newPlaybook failed: ${error}`);
      throw new Error(`Creating new playbook failed due to ${error}`);
    }
  }

  /**
   * Deletes a playbook file
   * @param path Path to the playbook file to delete
   */
  deletePlaybook(path: string): void {
    try {
      this.logger.debug(`deletePlaybook - Deleting ${path}`);
      this.shellWrapper.rm(path);
    } catch (error) {
      this.logger.error(`deletePlaybook failed: ${error}`);
      throw new Error(`Deleting playbook failed due to ${error}`);
    }
  }

  /**
   * Checks if a playbook file exists
   * @param path Path to the playbook file
   * @returns True if the file exists, false otherwise
   */
  testExistence(path: string): boolean {
    try {
      return this.shellWrapper.test('-f', path);
    } catch (error) {
      this.logger.error(`testExistence failed: ${error}`);
      throw new Error(`Testing playbook existence failed due to ${error}`);
    }
  }

  /**
   * Reads a configuration file if it exists
   * @param path Path to the configuration file
   * @returns The content of the configuration file or undefined if it doesn't exist
   */
  readConfigIfExists(path: string): any {
    try {
      this.logger.log('readPlaybookConfiguration - Starting...');
      if (!this.testExistence(path)) {
        this.logger.log('readPlaybookConfiguration - Not found');
        return undefined;
      }

      const config = this.shellWrapper.cat(path).toString();
      this.logger.log('readPlaybookConfiguration - Configuration found');
      return config;
    } catch (error) {
      this.logger.error(`readConfigIfExists failed: ${error}`);
      throw new Error(`Reading playbook configuration failed due to ${error}`);
    }
  }
}
