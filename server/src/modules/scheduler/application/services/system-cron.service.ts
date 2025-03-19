import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { SettingsKeys } from 'ssm-shared-lib';
import { IDevicesService } from '../../../devices';
import PinoLogger from '../../../../logger';
import { ICacheService } from '../../../../infrastructure/cache';
import { IAnsibleTaskRepository } from '../../../ansible';
import { IServerLogsRepository } from '../../../logs';
import { CronService } from './cron.service';

const logger = PinoLogger.child({ module: 'SystemCronService' });

@Injectable()
export class SystemCronService implements OnModuleInit {
  constructor(
    @Inject('IDevicesService')
    private readonly devicesService: IDevicesService,
    @Inject('IAnsibleTaskRepository')
    private readonly ansibleTaskRepo: IAnsibleTaskRepository,
    @Inject('IServerLogsRepository')
    private readonly logsRepo: IServerLogsRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
    private readonly cronService: CronService,
    private readonly schedulerRegistry: SchedulerRegistry
  ) {}

  async onModuleInit() {
    logger.info('Initializing SystemCronService');
    // Try to delete any existing crons to avoid duplicates
    try {
      this.schedulerRegistry.deleteCronJob('_isDeviceOffline');
      logger.info('Deleted existing _isDeviceOffline cron job');
    } catch (err) {
      // Job didn't exist, which is fine
    }

    try {
      this.schedulerRegistry.deleteCronJob('_CleanAnsibleTasksLogsAndStatuses');
      logger.info('Deleted existing _CleanAnsibleTasksLogsAndStatuses cron job');
    } catch (err) {
      // Job didn't exist, which is fine
    }

    try {
      this.schedulerRegistry.deleteCronJob('_CleanServerLogs');
      logger.info('Deleted existing _CleanServerLogs cron job');
    } catch (err) {
      // Job didn't exist, which is fine
    }
  }

  @Cron('0 * * * * *', { name: '_isDeviceOffline' })
  async checkOfflineDevices() {
    try {
      logger.info('Running offline device detection job');
      const jobName = '_isDeviceOffline';

      const delay = await this.cacheService.getFromCache(
        SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
        '5'
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

      const delay = await this.cacheService.getFromCache(
        SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
        '5'
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

      const delay = await this.cacheService.getFromCache(
        SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
        '5'
      );

      await this.logsRepo.deleteAllOld(parseInt(delay));
      await this.cronService.updateLastExecution(jobName);

      logger.info('Server logs cleanup job completed');
    } catch (error) {
      logger.error(`Error in server logs cleanup job: ${error}`);
    }
  }
}