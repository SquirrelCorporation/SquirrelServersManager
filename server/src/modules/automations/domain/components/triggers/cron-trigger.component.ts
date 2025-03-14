import * as CronJob from 'node-cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AutomationComponent } from '../automation.component';
import { AbstractTriggerComponent } from './abstract-trigger.component';

export class CronTriggerComponent extends AbstractTriggerComponent {
  public cronExpression: string;
  public cron: CronJob.ScheduledTask | undefined;
  private readonly schedulerRegistry: SchedulerRegistry;

  constructor(cronExpression: string, automation: AutomationComponent, schedulerRegistry: SchedulerRegistry) {
    super(automation);
    this.cronExpression = cronExpression;
    this.schedulerRegistry = schedulerRegistry;
    this.init();
  }

  private init() {
    const jobName = `automation-${this.automation.uuid}`;
    const job = CronJob.schedule(this.cronExpression, () => {
      void this.onCall();
    });

    try {
      if (this.schedulerRegistry.getCronJob(jobName)) {
        this.automation.childLogger.warn(
          `Cron job ${jobName} already exists. Skipping registration.`,
        );
        this.schedulerRegistry.deleteCronJob(jobName);
      }
      this.schedulerRegistry.addCronJob(jobName, job);
      this.cron = job;
      this.automation.childLogger.info(
        `Registered cron trigger with expression: ${this.cronExpression}`,
      );
    } catch (error: any) {
      // If the job already exists, stop the new one to prevent duplicates
      job.stop();
      this.automation.childLogger.warn(
        `Cron job ${jobName} already exists. Skipping registration.`,
      );
    }
  }

  deregister() {
    if (this.cron) {
      const jobName = `automation-${this.automation.uuid}`;
      try {
        this.schedulerRegistry.deleteCronJob(jobName);
      } catch (error) {
        // Ignore if the job doesn't exist
      }
      this.cron.stop();
      this.cron = undefined;
      this.automation.childLogger.info('Deregistered cron trigger');
    }
  }
}
