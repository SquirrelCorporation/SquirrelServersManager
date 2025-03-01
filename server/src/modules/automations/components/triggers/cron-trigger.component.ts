import * as CronJob from 'node-cron';
import { AutomationComponent } from '../automation.component';
import { AbstractTriggerComponent } from './abstract-trigger.component';

export class CronTriggerComponent extends AbstractTriggerComponent {
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
    this.automation.childLogger.info(
      `Registered cron trigger with expression: ${this.cronExpression}`,
    );
  }

  deregister() {
    if (this.cron) {
      this.cron.stop();
      this.automation.childLogger.info('Deregistered cron trigger');
    }
  }
}
