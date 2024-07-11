import CronJob from 'node-cron';
import AutomationComponent from '../AutomationComponent';
import AbstractTriggerComponent from './AbstractTriggerComponent';

export default class CronTriggerComponent extends AbstractTriggerComponent {
  public cronExpression: string;
  public cron: CronJob.ScheduledTask | undefined;

  constructor(cronExpression: string, automation: AutomationComponent) {
    super(automation);
    this.cronExpression = cronExpression;
    this.init();
  }

  private init() {
    this.cron = CronJob.schedule(this.cronExpression, () => {
      void this.onCall();
    });
  }

  deregister() {
    this.cron?.stop();
  }
}
