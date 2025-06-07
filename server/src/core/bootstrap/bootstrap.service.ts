import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SettingsKeys } from 'ssm-shared-lib';
import Events from 'src/core/events/events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private isSchemeVersionDifferent(schemeVersion: string | null): boolean {
    this.logger.log(
      `isSchemeVersionDifferent - schemeVersion: ${schemeVersion}, defaultValue: ${SettingsKeys.DefaultValue.SCHEME_VERSION}`,
    );
    return schemeVersion !== SettingsKeys.DefaultValue.SCHEME_VERSION;
  }

  async onApplicationBootstrap() {
    this.logger.log('Application bootstrapped. Performing post-bootstrap tasks...');

    const schemeVersion = (await this.cacheManager.get(
      SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION,
    )) as string | null;
    this.logger.log(`Scheme version: ${schemeVersion}`);
    if (this.isSchemeVersionDifferent(schemeVersion)) {
      await this.cacheManager.set(
        SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION,
        SettingsKeys.DefaultValue.SCHEME_VERSION,
      );
      this.logger.warn('Scheme version is different. Performing post-bootstrap tasks...');
      this.eventEmitter.emit(Events.UPDATED_SCHEME_VERSION);
    }
  }
}
