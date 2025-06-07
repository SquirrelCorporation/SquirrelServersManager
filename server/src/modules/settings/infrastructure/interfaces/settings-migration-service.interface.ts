import { OnModuleInit } from '@nestjs/common';

export const SETTINGS_MIGRATION_SERVICE = 'SETTINGS_MIGRATION_SERVICE';

/**
 * Interface for the Settings Migration Service
 */
export interface ISettingsMigrationService extends OnModuleInit {
  /**
   * Initialize the settings migration when the module is loaded
   */
  onModuleInit(): Promise<void>;

  /**
   * Migrate settings from the old implementation to the new one
   */
  migrateSettings(): Promise<void>;
}
