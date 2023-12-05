import CronJob from "node-cron";
import {CONSIDER_DEVICE_OFFLINE} from "../config";
import DeviceRepo from "../database/repository/DeviceRepo";
import logger from "../logger";
import CronRepo from "../database/repository/CronRepo";
import AnsibleLogsRepo from "../database/repository/AnsibleLogsRepo";
import AnsibleTaskStatusRepo from "../database/repository/AnsibleTaskStatusRepo";
import AnsibleTaskRepo from "../database/repository/AnsibleTaskRepo";

const CRONS = [
  {
    name: '_isDeviceOffline',
    schedule: '*/1 * * * *',
    fun: DeviceRepo.setDeviceOfflineAfter(CONSIDER_DEVICE_OFFLINE)
  },
  {
    name: '_CleanAnsibleTasksLogsAndStatuses',
    schedule: '*/5 * * * *',
    fun: AnsibleTaskRepo.deleteAllOldLogsAndStatuses(60)
  },
]

const initScheduledJobs = () => {
  CRONS.forEach(async cron => {
    await CronRepo.createIfNotExist({name: cron.name, expression: cron.schedule})
    const scheduledTask = CronJob.schedule(cron.schedule, () => {
      logger.info(`[CRON] - ${cron.name} is starting...`);
      cron.fun.then(() => {
        logger.info(`[CRON] - ${cron.name} has ended...`);
        CronRepo.updateCron({name: cron.name, lastExecution: new Date()});
      });
    });
    scheduledTask.start();
  })
}

export default initScheduledJobs;
