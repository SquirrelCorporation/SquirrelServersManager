import CronJob from 'node-cron';
import type { SSMServicesTypes } from '../../../../../types/typings';
import Component from '../../../core/Component';

export default class Lxc extends Component<SSMServicesTypes.ConfigurationWatcherSchema> {
  watchCron!: CronJob.ScheduledTask | undefined;
  watchCronStat!: CronJob.ScheduledTask | undefined;
  watchCronTimeout: any;
  watchCronDebounced: any = undefined;

  getConfigurationSchema() {
    return this.joi.object().keys({
      // TODO: move the default somewhere else
      host: this.joi.string(),
      port: this.joi.number().port(),
      username: this.joi.string(),
      password: this.joi.string(),
      cafile: this.joi.string(),
      certfile: this.joi.string(),
      keyfile: this.joi.string(),
      cron: this.joi.string().default('0 * * * *'),
      watchstats: this.joi.boolean().default(true),
      cronstats: this.joi.string().default('*/1 * * * *'),
      deviceUuid: this.joi.string().required(),
    });
  }

  async init() {}

  async deregisterComponent(): Promise<void> {
    this.childLogger.info('deregisterComponent');
    if (this.watchCron) {
      this.watchCron.stop();
      delete this.watchCron;
    }
    if (this.watchCronStat) {
      this.watchCronStat.stop();
      delete this.watchCronStat;
    }
    if (this.watchCronTimeout) {
      clearTimeout(this.watchCronTimeout);
    }
  }
}
