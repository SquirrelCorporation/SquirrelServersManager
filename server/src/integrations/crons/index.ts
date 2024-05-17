import CronJob from 'node-cron';
import { SettingsKeys } from 'ssm-shared-lib';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import logger from '../../logger';
import CronRepo from '../../data/database/repository/CronRepo';
import AnsibleTaskRepo from '../../data/database/repository/AnsibleTaskRepo';
import LogsRepo from '../../data/database/repository/LogsRepo';
import { getConfFromCache } from '../../data/cache';

const CRONS = [
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
];

const initScheduledJobs = () => {
  CRONS.forEach(async (cron) => {
    await CronRepo.updateOrCreateIfNotExist({ name: cron.name, expression: cron.schedule });
    const scheduledTask = CronJob.schedule(cron.schedule, () => {
      logger.info(`[CRON] - ${cron.name} is starting...`);
      cron.fun().then(() => {
        logger.info(`[CRON] - ${cron.name} has ended...`);
        CronRepo.updateCron({ name: cron.name, lastExecution: new Date() });
      });
    });
    scheduledTask.start();
  });
};

const stopAllScheduledJobs = () => {
  logger.warn('[CRON] - stopping all scheduled jobs.');
  CronJob.getTasks().forEach((e) => {
    e.stop();
  });
};

export default { initScheduledJobs, stopAllScheduledJobs };
