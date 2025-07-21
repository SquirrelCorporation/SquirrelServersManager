import { Inject, Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { SettingsKeys } from 'ssm-shared-lib';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import { ITaskLogsService, TASK_LOGS_SERVICE } from '@modules/ansible';
import { IServerLogsService, SERVER_LOGS_SERVICE } from '@modules/logs';
import { Cache } from '@nestjs/cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ISystemCronService } from '@modules/scheduler/doma../../domain/interfaces/system-cron-service.interface';
import PinoLogger from '../../../../logger';
import { CronService } from './cron.service';

const logger = PinoLogger.child({ module: 'SystemCronService' });

@Injectable()
export class SystemCronService implements ISystemCronService {
  constructor(
    @Inject(DEVICES_SERVICE)
    private readonly devicesService: IDevicesService,
    @Inject(TASK_LOGS_SERVICE)
    private readonly taskLogsService: ITaskLogsService,
    @Inject(SERVER_LOGS_SERVICE)
    private readonly serverLogsService: IServerLogsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cronService: CronService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    logger.info('Initializing SystemCronService');
    // Try to delete any existing crons to avoid duplicates
    try {
      this.schedulerRegistry.deleteCronJob('_isDeviceOffline');
      logger.info('Deleted existing _isDeviceOffline cron job');
    } catch {
      // Job didn't exist, which is fine
      logger.debug('No existing _isDeviceOffline cron job to delete');
    }

    try {
      this.schedulerRegistry.deleteCronJob('_CleanAnsibleTasksLogsAndStatuses');
      logger.info('Deleted existing _CleanAnsibleTasksLogsAndStatuses cron job');
    } catch {
      // Job didn't exist, which is fine
      logger.debug('No existing _CleanAnsibleTasksLogsAndStatuses cron job to delete');
    }

    try {
      this.schedulerRegistry.deleteCronJob('_CleanServerLogs');
      logger.info('Deleted existing _CleanServerLogs cron job');
    } catch {
      // Job didn't exist, which is fine
      logger.debug('No existing _CleanServerLogs cron job to delete');
    }
  }

  @Cron('0 * * * * *', { name: '_isDeviceOffline' })
  async checkOfflineDevices() {
    try {
      logger.info('Running offline device detection job');
      const jobName = '_isDeviceOffline';

      const delay =
        ((await this.cacheManager.get(
          SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
        )) as string) || '5';

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

      const delaySeconds =
        ((await this.cacheManager.get(
          SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
        )) as string) || '5';

      // Convert seconds to days (needed by service method)
      const delayDays = Math.max(1, Math.floor(parseInt(delaySeconds) / (24 * 60 * 60)));

      await this.taskLogsService.cleanOldTasksAndLogs(delayDays);
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

      const delay =
        ((await this.cacheManager.get(
          SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
        )) as string) || '5';

      // Use the deleteAllOld method with the retention period
      await this.serverLogsService.deleteAllOld(parseInt(delay));
      await this.cronService.updateLastExecution(jobName);

      logger.info('Server logs cleanup job completed');
    } catch (error) {
      logger.error(`Error in server logs cleanup job: ${error}`);
    }
  }
}
