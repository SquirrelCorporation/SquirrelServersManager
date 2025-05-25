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
  private networkFailureCount = 0;
  private readonly maxNetworkFailures = 5;
  private isClientHealthy = true;

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
        } catch (error) {
          this.handleNetworkFailure(error, 'opting out of telemetry');
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
        } catch (error) {
          this.handleNetworkFailure(error, 'identifying with telemetry service');
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

      // Check if client is healthy and should accept events
      if (!this.isClientHealthy) {
        this.logger.debug(
          `Telemetry client marked as unhealthy, skipping event: ${payload.eventName}`,
        );
        return;
      }

      if (telemetryEnabled && this.client && this._id) {
        this.client.capture({
          distinctId: this._id,
          event: payload.eventName,
          properties: payload.properties,
        });
        this.logger.debug(`Telemetry event captured: ${payload.eventName}`);
        // Reset failure count on successful operation
        this.networkFailureCount = 0;
      } else if (!telemetryEnabled) {
        // this.logger.debug(`Telemetry disabled, skipping event capture: ${eventName}`);
      } else if (!this.client) {
        this.logger.warn(
          `Telemetry client not initialized, cannot capture event: ${payload.eventName}`,
        );
      } else if (!this._id) {
        this.logger.warn(
          `Telemetry distinct ID not set, cannot capture event: ${payload.eventName}`,
        );
      }
    } catch (error) {
      this.handleNetworkFailure(error, `capturing event ${payload.eventName}`);
    }
  }

  private handleNetworkFailure(error: any, operation: string) {
    this.networkFailureCount++;

    if (this.networkFailureCount >= this.maxNetworkFailures) {
      this.isClientHealthy = false;
      this.logger.warn(
        `Telemetry client marked as unhealthy after ${this.maxNetworkFailures} failures. ` +
          `Will skip telemetry operations to prevent server impacts.`,
      );
    }

    this.logger.warn(
      `Failed to perform telemetry operation (${operation}), but continuing silently:`,
      error.message,
    );
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down TelemetryService due to signal: ${signal}`);
    if (this.client) {
      try {
        await this.client.shutdown();
        this.logger.log('PostHog client shut down successfully.');
      } catch (error) {
        this.handleNetworkFailure(error, 'shutting down PostHog client');
      }
    }
  }
}
