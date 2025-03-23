import CronJob from 'node-cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AutomationComponent } from '../automation.component';
import { AbstractTriggerComponent } from './abstract-trigger.component';

export class CronTriggerComponent extends AbstractTriggerComponent {
  public cronExpression: string;
  public cron: CronJob.ScheduledTask | undefined;
  private readonly schedulerRegistry: SchedulerRegistry;

  constructor(
    cronExpression: string,
    automation: AutomationComponent,
    schedulerRegistry: SchedulerRegistry,
  ) {
    super(automation);
    this.cronExpression = cronExpression;
    this.schedulerRegistry = schedulerRegistry;
    this.init();
  }

  private init() {
    this.automation.childLogger.info(`Initializing cron trigger ${this.cronExpression}`);
    this.cron = CronJob.schedule(this.cronExpression, () => {
      this.automation.childLogger.info(`Running cron trigger ${this.cronExpression}`);
      void this.onCall();
    });
  }

  deregister() {
    if (this.cron) {
      const jobName = `automation-${this.automation.uuid}`;
      try {
        this.schedulerRegistry.deleteCronJob(jobName);
      } catch {
        // Ignore if the job doesn't exist
      }
      this.cron.stop();
      this.cron = undefined;
      this.automation.childLogger.info('Deregistered cron trigger');
    }
  }
}
