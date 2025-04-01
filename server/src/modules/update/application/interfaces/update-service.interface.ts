import { OnModuleInit } from '@nestjs/common';

export const UPDATE_SERVICE = 'UPDATE_SERVICE';

/**
 * Interface for the Update Service
 */
export interface IUpdateService extends OnModuleInit {
  /**
   * Initialize the update service
   */
  onModuleInit(): void;

  /**
   * Checks if an update is available and stores the result in cache
   * @returns Promise that resolves when the check is complete
   */
  checkVersion(): Promise<void>;

  /**
   * Gets the current local version
   * @returns The current local version
   */
  getLocalVersion(): string;
}
