import CronJob from 'node-cron';
import { SettingsKeys } from 'ssm-shared-lib';
import ContainerStatsRepo from '../../data/database/repository/ContainerStatsRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import DeviceStatRepo from '../../data/database/repository/DeviceStatRepo';
import PinoLogger from '../../logger';
import CronRepo from '../../data/database/repository/CronRepo';
import AnsibleTaskRepo from '../../data/database/repository/AnsibleTaskRepo';
import LogsRepo from '../../data/database/repository/LogsRepo';
import { getConfFromCache } from '../../data/cache';

const logger = PinoLogger.child({ module: 'Cron' }, { msgPrefix: '[CRON] - ' });

interface CronJobType {
  name: string;
  schedule: string;
  fun: () => Promise<void>;
}

const CRONS: CronJobType[] = [
  {
    name: '_isDeviceOffline',
    schedule: '*/1 * * * *',
    fun: async () => {
      const delay = await getConfFromCache(
        SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
      );
      await DeviceRepo.setDeviceOfflineAfter(parseInt(delay));
    },
  },
  {
    name: '_CleanAnsibleTasksLogsAndStatuses',
    schedule: '*/5 * * * *',
    fun: async () => {
      const delay = await getConfFromCache(
        SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
      );
      await AnsibleTaskRepo.deleteAllOldLogsAndStatuses(parseInt(delay));
    },
  },
  {
    name: '_CleanServerLogs',
    schedule: '*/5 * * * *',
    fun: async () => {
      const delay = await getConfFromCache(
        SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
      );
      await LogsRepo.deleteAllOld(parseInt(delay));
    },
  },
  {
    name: '_CleanDeviceStats',
    schedule: '*/5 * * * *',
    fun: async () => {
      const delay = await getConfFromCache(
        SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS,
      );
      await DeviceStatRepo.deleteAllOld(parseInt(delay));
    },
  },
  {
    name: '_CleanContainerStats',
    schedule: '*/5 * * * *',
    fun: async () => {
      const delay = await getConfFromCache(
        SettingsKeys.GeneralSettingsKeys.CONTAINER_STATS_RETENTION_IN_DAYS,
      );
      await ContainerStatsRepo.deleteAllOld(parseInt(delay));
    },
  },
];

export default class Scheduler {
  static initScheduledJobs(): Promise<void[]> {
    return Promise.all(
      CRONS.map(async (cron) => {
        await CronRepo.updateOrCreateIfNotExist({ name: cron.name, expression: cron.schedule });

        const scheduledTask = CronJob.schedule(cron.schedule, async () => {
          logger.info(`${cron.name} is starting...`);
          await cron.fun();
          logger.info(` ${cron.name} has ended...`);
          void CronRepo.updateCron({ name: cron.name, lastExecution: new Date() });
        });

        scheduledTask.start();
      }),
    );
  }

  static stopAllScheduledJobs(): void {
    logger.warn('stopping all scheduled jobs.');
    CronJob.getTasks().forEach((e) => e.stop());
  }
}
