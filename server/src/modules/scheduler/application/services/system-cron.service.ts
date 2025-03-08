import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SettingsKeys } from 'ssm-shared-lib';
import { getConfFromCache } from '../../../../data/cache';
import { IDevicesService } from '../../../devices/application/interfaces/devices-service.interface';
import PinoLogger from '../../../../logger';
import { CronService } from './cron.service';

const logger = PinoLogger.child({ module: 'SystemCronService' });

@Injectable()
export class SystemCronService {
  constructor(
    @Inject('IDevicesService')
    private readonly devicesService: IDevicesService,
    @Inject('IAnsibleTaskRepository')
    private readonly ansibleTaskRepo: any, // Update to proper interface type when available
    @Inject('ILogsRepository')
    private readonly logsRepo: any, // Update to proper interface type when available
    private readonly cronService: CronService
  ) {}

  @Cron('0 * * * * *', { name: '_isDeviceOffline' })
  async checkOfflineDevices() {
    try {
      logger.info('Running offline device detection job');
      const jobName = '_isDeviceOffline';

      const delay = await getConfFromCache(
        SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
      );

      await this.devicesService.setDeviceOfflineAfter(parseInt(delay));
      await this.cronService.updateLastExecution(jobName);

      logger.info('Offline device detection job completed');
    } catch (error) {
      logger.error(`Error in offline device detection job: ${error}`);
    }
  }

  @Cron('0 */5 * * * *', { name: '_CleanAnsibleTasksLogsAndStatuses' })
  async cleanAnsibleLogs() {
    try {
      logger.info('Running Ansible logs cleanup job');
      const jobName = '_CleanAnsibleTasksLogsAndStatuses';

      const delay = await getConfFromCache(
        SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
      );

      await this.ansibleTaskRepo.deleteAllOldLogsAndStatuses(parseInt(delay));
      await this.cronService.updateLastExecution(jobName);

      logger.info('Ansible logs cleanup job completed');
    } catch (error) {
      logger.error(`Error in Ansible logs cleanup job: ${error}`);
    }
  }

  @Cron('0 */5 * * * *', { name: '_CleanServerLogs' })
  async cleanServerLogs() {
    try {
      logger.info('Running server logs cleanup job');
      const jobName = '_CleanServerLogs';

      const delay = await getConfFromCache(
        SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
      );

      await this.logsRepo.deleteAllOld(parseInt(delay));
      await this.cronService.updateLastExecution(jobName);

      logger.info('Server logs cleanup job completed');
    } catch (error) {
      logger.error(`Error in server logs cleanup job: ${error}`);
    }
  }
}