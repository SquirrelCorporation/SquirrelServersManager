import CronJob from 'node-cron';
import {
  CLEANUP_ANSIBLE_LOGS_AND_STATUSES,
  CLEANUP_SERVER_LOGS,
  CONSIDER_DEVICE_OFFLINE,
} from '../config';
import DeviceRepo from '../database/repository/DeviceRepo';
import logger from '../logger';
import CronRepo from '../database/repository/CronRepo';
import AnsibleTaskRepo from '../database/repository/AnsibleTaskRepo';
import LogsRepo from '../database/repository/LogsRepo';

const CRONS = [
  {
    name: '_isDeviceOffline',
    schedule: '*/1 * * * *',
    fun: async () => {
      await DeviceRepo.setDeviceOfflineAfter(CONSIDER_DEVICE_OFFLINE);
    },
  },
  {
    name: '_CleanAnsibleTasksLogsAndStatuses',
    schedule: '*/5 * * * *',
    fun: async () => {
      await AnsibleTaskRepo.deleteAllOldLogsAndStatuses(CLEANUP_ANSIBLE_LOGS_AND_STATUSES);
    },
  },
  {
    name: '_CleanServerLogs',
    schedule: '*/5 * * * *',
    fun: async () => {
      await LogsRepo.deleteAllOld(CLEANUP_SERVER_LOGS);
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

export default initScheduledJobs;
