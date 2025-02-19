import { SettingsKeys } from 'ssm-shared-lib';
import pinoLogger from '../../../logger';
import { setToCache } from '../index';

const logger = pinoLogger.child({ module: 'Cache' }, { msgPrefix: '[CACHE] - ' });

const REDIS_DEFAULT_VALUES: { key: string; value: string; nx: boolean }[] = [
  {
    key: SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION,
    value: SettingsKeys.DefaultValue.SCHEME_VERSION,
    nx: false,
  },
  {
    key: SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
    value: SettingsKeys.DefaultValue.SERVER_LOG_RETENTION_IN_DAYS,
    nx: true,
  },
  {
    key: SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
    value: SettingsKeys.DefaultValue.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
    nx: true,
  },
  {
    key: SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
    value: SettingsKeys.DefaultValue.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
    nx: true,
  },
  {
    key: SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
    value: SettingsKeys.DefaultValue.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
    nx: true,
  },
  {
    key: SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
    value: SettingsKeys.DefaultValue.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
    nx: true,
  },
  {
    key: SettingsKeys.GeneralSettingsKeys.CONTAINER_STATS_RETENTION_IN_DAYS,
    value: SettingsKeys.DefaultValue.CONTAINER_STATS_RETENTION_IN_DAYS,
    nx: true,
  },
  {
    key: SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS,
    value: SettingsKeys.DefaultValue.DEVICE_STATS_RETENTION_IN_DAYS,
    nx: true,
  },
  {
    key: SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE,
    value: SettingsKeys.DefaultValue.UPDATE_AVAILABLE,
    nx: true,
  },
];

async function initRedisValues(force?: boolean) {
  for (const value of REDIS_DEFAULT_VALUES) {
    logger.info(`initRedisValues - Setting default configuration ${value.key} to ${value.value}`);
    await setToCache(value.key, value.value, {
      NX: force ? false : value.nx,
    });
  }
}

export default initRedisValues;
