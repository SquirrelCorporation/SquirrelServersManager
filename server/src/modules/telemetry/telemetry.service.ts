import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';
import { SettingsKeys } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { OnEvent } from '@nestjs/event-emitter';
import Events from 'src/core/events/events';
import { TelemetryEventPayload } from './dto/telemetry-event-payload.dto';

@Injectable()
export class TelemetryService implements OnModuleInit, OnApplicationShutdown {
  private client?: PostHog;
  private _id?: string;
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const telemetryEnabled = this.configService.get<boolean>('TELEMETRY_ENABLED');
      this.logger.log(`Telemetry enabled: ${telemetryEnabled}`);

      this.client = new PostHog('phc_wJKUU2ssGzXxFferOrilvhErmTxvx8jZCf77PCW24JG', {
        host: 'https://us.i.posthog.com',
        disableGeoip: true, // Reduce network dependency
        requestTimeout: 5000, // 5 second timeout
        featureFlagsPollingInterval: 0, // Disable feature flag polling
      });

      if (!telemetryEnabled) {
        this.logger.log('Telemetry disabled, opting out.');
        try {
          await this.client.optOut();
        } catch {
          this.logger.warn('Failed to opt out of telemetry, continuing silently');
        }
        return; // Don't proceed with identifying if telemetry is disabled
      }

      let installId = await this.cacheManager.get<string>(
        SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
      );

      if (!installId) {
        this.logger.log('Install ID not found in cache, generating a new one.');
        installId = uuidv4();
        await this.cacheManager.set(SettingsKeys.GeneralSettingsKeys.INSTALL_ID, installId);
        this.logger.log(`New Install ID generated and saved: ${installId}`);
      } else {
        this.logger.log(`Install ID found in cache: ${installId}`);
      }

      this._id = installId as string;
      if (this._id) {
        try {
          this.client.identify({ distinctId: this._id as string });
          this.logger.log(`Telemetry identified with distinct ID: ${this._id}`);
        } catch {
          this.logger.warn('Failed to identify with telemetry service, continuing silently');
        }
      }
    } catch (error: any) {
      this.logger.error(
        'Failed to initialize telemetry service, but continuing application startup:',
        error.message,
      );
      // Ensure the application continues to start even if telemetry fails
      this.client = undefined;
      this._id = undefined;
    }
  }

  @OnEvent(Events.TELEMETRY_EVENT)
  public capture(payload: TelemetryEventPayload) {
    try {
      const telemetryEnabled = this.configService.get<boolean>('TELEMETRY_ENABLED');
      if (telemetryEnabled && this.client && this._id) {
        this.client.capture({
          distinctId: this._id,
          event: payload.eventName,
          properties: payload.properties,
        });
        this.logger.debug(`Telemetry event captured: ${payload.eventName}`);
      }
    } catch {
      this.logger.warn('Failed to capture telemetry event, continuing silently');
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down TelemetryService due to signal: ${signal}`);
    if (this.client) {
      try {
        await this.client.shutdown();
        this.logger.log('PostHog client shut down successfully.');
      } catch {
        this.logger.warn('Failed to shutdown telemetry client, continuing silently');
      }
    }
  }
}
