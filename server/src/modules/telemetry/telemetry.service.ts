import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';
import { SettingsKeys } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { OnEvent } from '@nestjs/event-emitter';
import Events from 'src/core/events/events';

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
    const telemetryEnabled = this.configService.get<boolean>('TELEMETRY_ENABLED');
    this.logger.log(`Telemetry enabled: ${telemetryEnabled}`);

    this.client = new PostHog('phc_wJKUU2ssGzXxFferOrilvhErmTxvx8jZCf77PCW24JG', {
      host: 'https://us.i.posthog.com',
      flushAt: 1, // Send events immediately for serverless environments or short-lived processes
      flushInterval: 0, // Disable interval flushing
    });

    if (!telemetryEnabled) {
      this.logger.log('Telemetry disabled, opting out.');
      await this.client.optOut();
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

    this._id = installId;
    this.client.identify({ distinctId: this._id });
    this.logger.log(`Telemetry identified with distinct ID: ${this._id}`);
  }

  @OnEvent(Events.TELEMETRY_EVENT)
  public capture(payload: { eventName: string; properties?: Record<string, any> }) {
    const telemetryEnabled = this.configService.get<boolean>('TELEMETRY_ENABLED');
    if (telemetryEnabled && this.client && this._id) {
      this.client.capture({
        distinctId: this._id,
        event: payload.eventName,
        properties: payload.properties,
      });
      this.logger.debug(`Telemetry event captured: ${payload.eventName}`);
    } else if (!telemetryEnabled) {
      // this.logger.debug(`Telemetry disabled, skipping event capture: ${eventName}`);
    } else if (!this.client) {
      this.logger.warn(
        `Telemetry client not initialized, cannot capture event: ${payload.eventName}`,
      );
    } else if (!this._id) {
      this.logger.warn(`Telemetry distinct ID not set, cannot capture event: ${payload.eventName}`);
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down TelemetryService due to signal: ${signal}`);
    if (this.client) {
      await this.client.shutdown();
      this.logger.log('PostHog client shut down successfully.');
    }
  }
}
