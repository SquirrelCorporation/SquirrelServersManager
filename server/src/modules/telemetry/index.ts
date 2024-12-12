import { PostHog } from 'posthog-node';
import { SettingsKeys } from 'ssm-shared-lib';
import { TELEMETRY_ENABLED } from '../../config';
import { getFromCache } from '../../data/cache';
import logger from '../../logger';

class Telemetry {
  private client;
  private _id!: string;

  constructor() {
    this.client = new PostHog('phc_wJKUU2ssGzXxFferOrilvhErmTxvx8jZCf77PCW24JG', {
      host: 'https://us.i.posthog.com',
    });
  }

  public capture(eventName: string) {
    if (TELEMETRY_ENABLED) {
      this.client.capture({ distinctId: this._id, event: eventName });
    }
  }

  public async init() {
    const installId = await getFromCache(SettingsKeys.GeneralSettingsKeys.INSTALL_ID);
    if (!installId) {
      logger.error('Install ID not found');
    }
    if (installId) {
      this._id = installId;
      this.client.identify({ distinctId: this._id });
    }
    if (!TELEMETRY_ENABLED) {
      await this.client.optOut();
    }
  }

  public async shutdown() {
    await this.client.shutdown();
  }
}

export default new Telemetry();
