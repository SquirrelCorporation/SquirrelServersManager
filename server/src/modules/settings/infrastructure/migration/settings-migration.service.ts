import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SettingsService } from '../../application/services/settings.service';

@Injectable()
export class SettingsMigrationService implements OnModuleInit {
  private readonly logger = new Logger(SettingsMigrationService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async onModuleInit() {
    await this.migrateSettings();
  }

  /**
   * Migrate settings from the old implementation to the new one
   */
  async migrateSettings(): Promise<void> {
    this.logger.log('Starting settings migration');

    try {
      // The settings service already initializes default values
      // This method can be extended to migrate settings from other sources if needed
      this.logger.log('Settings migration completed successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error migrating settings: ${errorMessage}`);
    }
  }
}