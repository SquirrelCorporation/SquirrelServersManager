import { Injectable } from '@nestjs/common';
import { GiteaRegistryComponent } from './gitea-registry.component';
import PinoLogger from '../../../../../logger';

const logger = PinoLogger.child({ module: 'ForgejoRegistryComponent' }, { msgPrefix: '[FORGEJO_REGISTRY] - ' });

/**
 * Forgejo Container Registry implementation
 * Forgejo is a fork of Gitea, so most functionality is the same
 */
@Injectable()
export class ForgejoRegistryComponent extends GiteaRegistryComponent {
  /**
   * Setup the registry component
   */
  protected async setup(): Promise<void> {
    logger.info(`Setting up Forgejo Container Registry: ${this.name}`);
    await super.setup();
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    logger.info(`Cleaning up Forgejo Container Registry: ${this.name}`);
    await super.cleanup();
  }

  /**
   * Handle configuration updates
   */
  protected async onConfigurationUpdated(): Promise<void> {
    logger.info(`Updating Forgejo Container Registry configuration: ${this.name}`);
    await super.onConfigurationUpdated();
  }

  /**
   * Test connection to the registry
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.info(`Testing connection to Forgejo at ${this.configuration.url || 'unknown'}`);
      return await super.testConnection();
    } catch (error) {
      logger.error(`Forgejo connection test failed: ${error.message}`);
      return false;
    }
  }
}